import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { DB } from '@/lib/db'
import { UserProfile, normalizeEthiopianPhone, isValidEthiopianPhone, validatePasswordStrength } from '@/lib/store'

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}

function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false
  const parts = storedHash.split(':')
  if (parts.length !== 2) return false
  const [salt, originalHash] = parts
  const testHash = hashPassword(password, salt)
  return testHash === originalHash
}

function sanitizeUser(user: UserProfile): Omit<UserProfile, 'passwordHash'> {
  const { passwordHash, ...safe } = user
  return safe
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, email, password, name, phone, subcity, userId, currentPassword, newPassword, addresses } = body

    const users = DB.getUsers()

    // 1. ADMIN LOGIN
    if (action === 'admin-login') {
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@rideaddis.et').toLowerCase()
      const adminPassword = process.env.ADMIN_PASSWORD || 'rideaddis2026'

      const emailClean = (email || '').trim().toLowerCase()
      const passClean = (password || '').trim()

      if (emailClean === adminEmail && passClean === adminPassword) {
        return NextResponse.json({
          success: true,
          role: 'admin',
          token: 'token_admin_' + Date.now(),
          user: {
            id: 'admin_1',
            email: adminEmail,
            name: 'Ride Addis Master Admin',
            role: 'admin'
          }
        })
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid administrator email or password.' },
          { status: 401 }
        )
      }
    }

    // 2. USER REGISTRATION (DEEP AUTH & VALIDATION)
    if (action === 'register') {
      const cleanName = (name || '').trim()
      const cleanEmail = (email || '').trim().toLowerCase()
      const cleanPhone = (phone || '').trim()
      const cleanPass = password || ''

      if (!cleanName) {
        return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 })
      }
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
      }
      if (!cleanPhone) {
        return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 })
      }

      // Validate Phone Format
      if (!isValidEthiopianPhone(cleanPhone)) {
        return NextResponse.json({
          success: false,
          error: 'Please enter a valid Ethiopian phone number (e.g., 091 123 4567 or +251 91 123 4567).'
        }, { status: 400 })
      }

      const normalizedPhone = normalizeEthiopianPhone(cleanPhone)

      // Strict Password Strength
      const passwordCheck = validatePasswordStrength(cleanPass)
      if (!passwordCheck.isValid) {
        return NextResponse.json({ success: false, error: passwordCheck.error }, { status: 400 })
      }

      // Check Duplicate Email in Database
      const emailConflict = users.find(u => u.email.toLowerCase() === cleanEmail)
      if (emailConflict) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.'
        }, { status: 400 })
      }

      // Check Duplicate Phone in Database (Strict: One Phone Number = One Account)
      const phoneConflict = users.find(u => normalizeEthiopianPhone(u.phone) === normalizedPhone)
      if (phoneConflict) {
        return NextResponse.json({
          success: false,
          error: 'This phone number is already registered to another account. Each account must have a unique phone number.'
        }, { status: 400 })
      }

      // Hash password securely with salt
      const salt = generateSalt()
      const storedHash = `${salt}:${hashPassword(cleanPass, salt)}`

      const newUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        phone: normalizedPhone,
        subcity: subcity || 'Bole, Addis Ababa',
        passwordHash: storedHash,
        createdAt: new Date().toISOString(),
        role: 'customer',
        addresses: [
          {
            id: 'addr_' + Date.now(),
            label: 'Home',
            recipient: cleanName,
            phone: normalizedPhone,
            subcity: subcity || 'Bole, Addis Ababa',
            street: 'Addis Ababa Street',
            landmark: 'Near Roundabout',
            isDefault: true
          }
        ]
      }

      users.push(newUser)
      DB.saveUsers(users)

      return NextResponse.json({
        success: true,
        user: sanitizeUser(newUser),
        token: 'token_usr_' + newUser.id
      })
    }

    // 3. USER LOGIN (DEEP CREDENTIAL VERIFICATION)
    if (action === 'login') {
      const cleanEmail = (email || '').trim().toLowerCase()
      const cleanPass = password || ''

      if (!cleanEmail || !cleanPass) {
        return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 })
      }

      const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail)
      if (!foundUser) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 })
      }

      // Verify hashed password
      if (foundUser.passwordHash) {
        const isMatch = verifyPassword(cleanPass, foundUser.passwordHash)
        if (!isMatch) {
          return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 })
        }
      }

      return NextResponse.json({
        success: true,
        user: sanitizeUser(foundUser),
        token: 'token_usr_' + foundUser.id
      })
    }

    // 4. PROFILE UPDATE (WITH UNIQUE PHONE NUMBER VERIFICATION IN DATABASE)
    if (action === 'update-profile') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 })
      }

      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
      }

      const existingUser = users[userIndex]
      const cleanPhone = (phone || existingUser.phone).trim()

      // Validate Phone Format if updated
      if (cleanPhone && !isValidEthiopianPhone(cleanPhone)) {
        return NextResponse.json({
          success: false,
          error: 'Please enter a valid Ethiopian phone number (e.g., 091 123 4567 or +251 91 123 4567).'
        }, { status: 400 })
      }

      const normalizedPhone = normalizeEthiopianPhone(cleanPhone)

      // Strict Duplicate Phone Check: Ensure no other user has this phone number
      const phoneConflict = users.find(
        u => u.id !== userId && normalizeEthiopianPhone(u.phone) === normalizedPhone
      )
      if (phoneConflict) {
        return NextResponse.json({
          success: false,
          error: `The phone number ${normalizedPhone} is already in use by another cyclist account. Please provide a different phone number.`
        }, { status: 400 })
      }

      // Update user details
      const updatedUser: UserProfile = {
        ...existingUser,
        name: (name || existingUser.name).trim(),
        phone: normalizedPhone,
        subcity: subcity || existingUser.subcity,
        addresses: addresses || existingUser.addresses
      }

      users[userIndex] = updatedUser
      DB.saveUsers(users)

      return NextResponse.json({
        success: true,
        user: sanitizeUser(updatedUser)
      })
    }

    // 5. CHANGE PASSWORD
    if (action === 'change-password') {
      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Current and new password are required.' }, { status: 400 })
      }

      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
      }

      const existingUser = users[userIndex]
      if (existingUser.passwordHash) {
        const isCurrentValid = verifyPassword(currentPassword, existingUser.passwordHash)
        if (!isCurrentValid) {
          return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 })
        }
      }

      const strengthCheck = validatePasswordStrength(newPassword)
      if (!strengthCheck.isValid) {
        return NextResponse.json({ success: false, error: strengthCheck.error }, { status: 400 })
      }

      const salt = generateSalt()
      existingUser.passwordHash = `${salt}:${hashPassword(newPassword, salt)}`
      users[userIndex] = existingUser
      DB.saveUsers(users)

      return NextResponse.json({ success: true, message: 'Password updated successfully.' })
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 })
  } catch (error: any) {
    console.error('Auth API Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 })
  }
}
