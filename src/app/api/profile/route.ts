import { NextRequest, NextResponse } from 'next/server'

interface UserProfile {
  id?: string
  user_id?: string
  first_name: string
  last_name: string
  avatar_url?: string
  company_name: string
  company_description?: string
  industry: string
  website?: string
  primary_color: string
  secondary_color: string
  logo_url?: string
  created_at?: string
  updated_at?: string
}

// Mock data for development - replace with real database calls
let mockProfile: UserProfile = {
  id: '1',
  user_id: '1', 
  first_name: 'John',
  last_name: 'Doe',
  company_name: 'Acme Inc',
  company_description: 'A leading technology company focused on innovative solutions',
  industry: 'Technology',
  website: 'https://acme.com',
  primary_color: '#8b5cf6',
  secondary_color: '#06b6d4',
  logo_url: '',
  avatar_url: ''
}

export async function GET(request: NextRequest) {
  try {
    // In real app, get user ID from auth session
    // const userId = await getUserIdFromSession(request)
    
    // For now, return mock data
    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    
    // In real app, validate and save to database
    // const userId = await getUserIdFromSession(request)
    
    // Update mock data
    mockProfile = {
      ...mockProfile,
      ...profileData,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profileData = await request.json()
    
    // In real app, validate and save to database
    // const userId = await getUserIdFromSession(request)
    
    // Update mock data
    mockProfile = {
      ...mockProfile,
      ...profileData,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 