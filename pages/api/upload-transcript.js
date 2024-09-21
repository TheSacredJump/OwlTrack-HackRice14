import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'tmp');
  
  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Failed to process file upload' });
    }

    const file = files.transcript?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', file);
    console.log('File path:', file.filepath);

    if (!fs.existsSync(file.filepath)) {
      console.error('File does not exist at path:', file.filepath);
      return res.status(500).json({ error: 'File not found after upload' });
    }

    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(file.filepath);
      formData.append('file', fileStream, file.originalFilename);

      console.log('Sending request to Flask server...');
      const response = await axios.post('http://127.0.0.1:5000/parse-transcript', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      console.log('Received response from Flask server:', response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error processing transcript:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {""
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      res.status(500).json({ error: 'Failed to process transcript', details: error.message });
    } finally {
      // Clean up the uploaded file
      if (fs.existsSync(file.filepath)) {
        fs.unlink(file.filepath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
          else console.log('File deleted successfully');
        });
      } else {
        console.log('File not found for deletion');
      }
    }
  });
}