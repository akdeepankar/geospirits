'use server'

import { createClient } from '../lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 100) // Limit length
}

export async function publishPage(pageData: {
  title: string
  siteName: string
  customSlug: string
  components: any[]
  theme: 'light' | 'dark'
  headerImage?: string
  latitude: number
  longitude: number
  locationName?: string
  pageAnimation?: string
  animationIntensity?: number
  chatbotEnabled?: boolean
  chatbotApiKey?: string
  chatbotCharacterName?: string
  chatbotCharacterPrompt?: string
  chatbotButtonImage?: string
  chatbotButtonEmoji?: string
  themeColor?: string
}) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'You must be logged in to publish a page' }
  }

  // Use custom slug or generate from title
  let slug = pageData.customSlug || generateSlug(pageData.title)
  
  // Check if slug already exists and make it unique if needed
  let slugExists = true
  let counter = 1
  let finalSlug = slug
  
  while (slugExists) {
    const { data: existingPage } = await supabase
      .from('pages')
      .select('slug')
      .eq('slug', finalSlug)
      .single()
    
    if (!existingPage) {
      slugExists = false
    } else {
      finalSlug = `${slug}-${counter}`
      counter++
    }
  }

  const { data, error } = await supabase
    .from('pages')
    .insert({
      user_id: user.id,
      title: pageData.title,
      site_name: pageData.siteName,
      slug: finalSlug,
      components: pageData.components,
      theme: pageData.theme,
      header_image: pageData.headerImage || null,
      latitude: pageData.latitude,
      longitude: pageData.longitude,
      location_name: pageData.locationName,
      page_animation: pageData.pageAnimation || 'none',
      animation_intensity: pageData.animationIntensity || 1,
      chatbot_enabled: pageData.chatbotEnabled || false,
      chatbot_api_key: pageData.chatbotApiKey || null,
      chatbot_character_name: pageData.chatbotCharacterName || null,
      chatbot_character_prompt: pageData.chatbotCharacterPrompt || null,
      chatbot_button_image: pageData.chatbotButtonImage || null,
      chatbot_button_emoji: pageData.chatbotButtonEmoji || null,
      theme_color: pageData.themeColor || '#8b008b',
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/create')
  revalidatePath(`/${finalSlug}`)
  return { success: true, pageId: data.id, slug: finalSlug }
}

export async function getUserPages() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'You must be logged in to view your pages' }
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .order('published_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { pages: data }
}

export async function getPageBySlug(slug: string) {
  const supabase = await createClient()
  
  // First fetch the page
  const { data: pageData, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (pageError) {
    console.error('Error fetching page:', pageError);
    return { error: pageError.message }
  }

  // Then fetch the user's email separately
  const { data: userData } = await supabase.auth.admin.getUserById(pageData.user_id)
  
  return { 
    page: {
      ...pageData,
      creator_email: userData?.user?.email || null
    }
  }
}

export async function getAllPublishedPages() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .select('id, title, site_name, slug, latitude, longitude, location_name, header_image, published_at, user_id')
    .order('published_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Fetch creator emails for all pages
  const pagesWithEmails = await Promise.all(
    (data || []).map(async (page) => {
      const { data: userData } = await supabase.auth.admin.getUserById(page.user_id)
      return {
        ...page,
        creator_email: userData?.user?.email || null
      }
    })
  )

  return { pages: pagesWithEmails }
}


export async function deletePage(pageId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'You must be logged in to delete a page' }
  }

  // Delete the page (RLS ensures user can only delete their own pages)
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my-sites')
  return { success: true }
}


export async function getPageForEdit(pageId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'You must be logged in to edit a page' }
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { page: data }
}

export async function updatePage(pageId: string, pageData: {
  title: string
  siteName: string
  customSlug?: string
  components: any[]
  theme: 'light' | 'dark'
  headerImage?: string
  latitude: number
  longitude: number
  locationName?: string
  pageAnimation?: string
  animationIntensity?: number
  chatbotEnabled?: boolean
  chatbotApiKey?: string
  chatbotCharacterName?: string
  chatbotCharacterPrompt?: string
  chatbotButtonImage?: string
  chatbotButtonEmoji?: string
  themeColor?: string
}) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'You must be logged in to update a page' }
  }

  const { data, error } = await supabase
    .from('pages')
    .update({
      title: pageData.title,
      site_name: pageData.siteName,
      components: pageData.components,
      theme: pageData.theme,
      header_image: pageData.headerImage || null,
      latitude: pageData.latitude,
      longitude: pageData.longitude,
      location_name: pageData.locationName,
      page_animation: pageData.pageAnimation || 'none',
      animation_intensity: pageData.animationIntensity || 1,
      chatbot_enabled: pageData.chatbotEnabled || false,
      chatbot_api_key: pageData.chatbotApiKey || null,
      chatbot_character_name: pageData.chatbotCharacterName || null,
      chatbot_character_prompt: pageData.chatbotCharacterPrompt || null,
      chatbot_button_image: pageData.chatbotButtonImage || null,
      chatbot_button_emoji: pageData.chatbotButtonEmoji || null,
      theme_color: pageData.themeColor || '#8b008b',
      updated_at: new Date().toISOString(),
    })
    .eq('id', pageId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/my-sites')
  revalidatePath(`/${data.slug}`)
  return { success: true, slug: data.slug }
}
