import express from 'express'
import dotenv from 'dotenv'
import multer from 'multer'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const app = express()
app.use(cors())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
})

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Wedding Moonlight Server Ready!'
  })
})
app.post('/api/reception-upload', upload.array('photos', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select photos'
      })
    }

    const uploadedPhotos = []

    for (const file of req.files) {
      if (!file.mimetype.startsWith('image/')) {
        continue
      }

      const extension = file.mimetype.split('/')[1]
      const filePath = 'reception-' + Date.now() + '-' +
        Math.random().toString(36).slice(2) + '.' + extension

      const { data, error } = await supabaseAdmin
        .storage
        .from('reception-photos')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        })

      if (error) throw error

      uploadedPhotos.push(data.path)
    }

    res.json({
      success: true,
      message: 'Reception photos uploaded!',
      photos: uploadedPhotos
    })

  } catch (error) {
    console.error('Reception Upload Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Reception upload failed'
    })
  }
})
app.post('/api/test-upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a photo'
      })
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed'
      })
    }

    const filePath = 'guest-' + Date.now() + '.jpg'

    const { data, error } = await supabaseAdmin
      .storage
      .from('guest-selfies')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      })

    if (error) throw error

    res.json({
      success: true,
      message: 'Photo saved in Supabase!',
      path: data.path
    })

  } catch (error) {
    console.error('Upload Error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Supabase upload failed'
    })
  }
})
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT)
})