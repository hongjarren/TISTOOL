import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("Attempting to connect to MongoDB with URI:", uri ? "URI is defined" : "URI is undefined");
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Form Submission Schema with enhanced validation
const formSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name must be less than 100 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces'
    }
  },
  productLine: {
    type: String,
    required: [true, 'Product Line is required'],
    enum: {
      values: [
        '12', '13', '15', '24', '25', '45', '80', '1A', '1B', '1H', '3E', '4W', '8F', 
        'AE', 'AV', 'BL', 'CM', 'CN', 'DI', 'DT', 'EG', 'GM', 'GM(EIP)', 'LB', 
        'MMA', 'NA', 'NS', 'NT', 'QB', 'QW', 'QX', 'SP', 'TG', 'TJ', 'WN Kobe', 
        'WN PMPS', 'WN Soco', 'WN TAO'
      ],
      message: 'Please select a valid product line'
    }
  },
  erCode: {
    type: String,
    required: [true, 'ER Code is required'],
    validate: {
      validator: function(v) {
        return /^ER[0-9]{6}$/.test(v);
      },
      message: 'ER Code format must be ER followed by 6 digits'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description must be less than 500 characters']
  },
  modelNumber: {
    type: String,
    required: [true, 'Model Number is required'],
    validate: {
      validator: function(v) {
        return /^[A-Z]{2}[0-9]{4}[A-Z]?$/.test(v);
      },
      message: 'Model Number format must be 2 letters + 4 digits + optional letter'
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key].trim());
      }
    });
  }
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

// Routes
// Create new submission
app.post('/api/submissions', sanitizeInput, async (req, res) => {
  try {
    const formData = req.body;
    
    // Additional server-side validation
    if (!formData.name || !formData.productLine || !formData.erCode || 
        !formData.description || !formData.modelNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const newSubmission = new FormSubmission({
      ...formData,
      submittedAt: new Date()
    });
    
    await newSubmission.save();
    
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: newSubmission
    });
  } catch (error) {
    console.error('Error saving form submission:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to save form submission',
      error: error.message
    });
  }
});

// Get all submissions with pagination
app.get('/api/submissions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const submissions = await FormSubmission
      .find()
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await FormSubmission.countDocuments();
    
    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + submissions.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// Get single submission by ID
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }
    
    const submission = await FormSubmission.findById(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
});

// Delete submission by ID
app.delete('/api/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID'
      });
    }
    
    const submission = await FormSubmission.findByIdAndDelete(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Use error handling middleware
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
