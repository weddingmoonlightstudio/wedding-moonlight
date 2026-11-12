import { supabase } from './supabase.js'

console.log("Wedding Moonlight Connected!")
console.log("Supabase Client:", supabase)

async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    console.log("Server Response:", data.message)
  } catch (error) {
    console.error("Server Connection Failed:", error)
  }
}

checkServer()

const selfie = document.getElementById('selfie')

if (selfie) {
  selfie.addEventListener('change', async function () {
    const file = this.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await fetch('http://localhost:3000/api/test-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log('Upload Test:', result)
      alert(result.message)
    } catch (error) {
      console.error(error)
      alert('Upload failed. Please try again.')
    }
  })
}