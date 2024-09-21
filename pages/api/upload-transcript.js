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

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'tmp'),
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      res.status(500).json({ error: 'Failed to process transcript', details: error.message });
    } finally {
      // Clean up the uploaded file
      fs.unlink(file.filepath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        else console.log('File deleted successfully');
      });
    }
  });
}