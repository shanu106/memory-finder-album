import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleDriveTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET')
  const refreshToken = Deno.env.get('GOOGLE_DRIVE_REFRESH_TOKEN')

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google Drive credentials')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  const data = await response.json() as GoogleDriveTokenResponse
  return data.access_token
}

async function createFolder(accessToken: string, folderName: string, parentId?: string): Promise<string> {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  }

  if (parentId) {
    metadata.parents = [parentId]
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  })

  if (!response.ok) {
    throw new Error('Failed to create folder')
  }

  const data = await response.json()
  return data.id
}

async function uploadFile(
  accessToken: string,
  fileData: Uint8Array,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
  }

  if (folderId) {
    metadata.parents = [folderId]
  }

  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadataPart = delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata)

  const filePart = delimiter +
    `Content-Type: ${mimeType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    btoa(String.fromCharCode(...fileData))

  const multipartRequestBody = metadataPart + filePart + closeDelimiter

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Upload error:', error)
    throw new Error('Failed to upload file to Google Drive')
  }

  const data = await response.json()
  
  // Make file publicly accessible
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  })

  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
    webContentLink: `https://drive.google.com/uc?export=view&id=${data.id}`,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const formData = await req.formData()
    const action = formData.get('action') as string

    console.log('Action:', action)

    const accessToken = await getAccessToken()

    if (action === 'create_album') {
      const coupleNames = formData.get('coupleNames') as string
      const eventDate = formData.get('eventDate') as string
      const coverPhoto = formData.get('coverPhoto') as File
      const accessCode = formData.get('accessCode') as string

      console.log('Creating album:', coupleNames)

      // Create folder in Google Drive
      const folderId = await createFolder(accessToken, `${coupleNames} - ${eventDate}`)
      console.log('Folder created:', folderId)

      // Upload cover photo
      const coverPhotoBuffer = await coverPhoto.arrayBuffer()
      const coverPhotoData = new Uint8Array(coverPhotoBuffer)
      const coverPhotoResult = await uploadFile(
        accessToken,
        coverPhotoData,
        coverPhoto.name,
        coverPhoto.type,
        folderId
      )

      console.log('Cover photo uploaded:', coverPhotoResult.fileId)

      // Save to database
      const { data: album, error: albumError } = await supabaseClient
        .from('albums')
        .insert({
          couple_names: coupleNames,
          event_date: eventDate,
          cover_photo_url: coverPhotoResult.webContentLink,
          cover_photo_drive_id: coverPhotoResult.fileId,
          drive_folder_id: folderId,
          access_code: accessCode,
          created_by: user.id,
        })
        .select()
        .single()

      if (albumError) {
        console.error('Database error:', albumError)
        throw albumError
      }

      console.log('Album created in database:', album.id)

      return new Response(JSON.stringify({ success: true, album }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'upload_photos') {
      const albumId = formData.get('albumId') as string
      const files = formData.getAll('photos') as File[]

      console.log('Uploading photos to album:', albumId)

      // Get album folder ID
      const { data: album, error: albumError } = await supabaseClient
        .from('albums')
        .select('drive_folder_id')
        .eq('id', albumId)
        .single()

      if (albumError || !album) {
        throw new Error('Album not found')
      }

      const uploadResults = []

      for (const file of files) {
        console.log('Uploading file:', file.name)
        const fileBuffer = await file.arrayBuffer()
        const fileData = new Uint8Array(fileBuffer)
        const result = await uploadFile(
          accessToken,
          fileData,
          file.name,
          file.type,
          album.drive_folder_id
        )

        // Save to database
        const { data: photo, error: photoError } = await supabaseClient
          .from('photos')
          .insert({
            album_id: albumId,
            drive_file_id: result.fileId,
            drive_file_url: result.webContentLink,
            thumbnail_url: result.webContentLink,
            file_name: file.name,
          })
          .select()
          .single()

        if (photoError) {
          console.error('Photo database error:', photoError)
        } else {
          uploadResults.push(photo)
        }
      }

      console.log('Photos uploaded:', uploadResults.length)

      return new Response(JSON.stringify({ success: true, photos: uploadResults }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})