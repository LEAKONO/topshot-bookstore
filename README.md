
# 📚 Topshot Bookstore

A modern, full-stack e-commerce bookstore application built with React, Express.js, and MongoDB. Features user authentication, book management, shopping cart functionality, and order processing.

## Features

### Frontend Features
- **Modern React UI** - Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design** - Mobile-first design that works on all devices
- **User Authentication** - Register, login, and profile management
- **Book Browsing** - Search, filter, and categorize books
- **Shopping Cart** - Add/remove items with real-time updates
- **Order Management** - Place orders and track order history
- **Admin Dashboard** - Book and order management for administrators

### Backend Features
- **REST API** - Comprehensive RESTful API with Express.js
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - User and admin roles with different permissions
- **MongoDB Integration** - Robust data modeling with Mongoose
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling and logging
- **Security** - Rate limiting, CORS, and security headers

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Request validation middleware

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/LEAKONO/topshot-bookstore
cd topshot-bookstore-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

### Backend Setup

1. **Navigate to backend directory**
```bash
mkdir topshot-bookstore-backend
cd topshot-bookstore-backend
```

2. **Initialize and install dependencies**
```bash
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-validator multer cloudinary helmet express-rate-limit
npm install -D nodemon
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
MONGODB_URI=mongodb://localhost:27017/topshot-bookstore
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=http://localhost:8080
```

5. **Start the server**
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user|admin),
  phone: String,
  address: Object,
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Book Model
```javascript
{
  title: String,
  author: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  isbn: String (unique),
  publisher: String,
  publishedDate: Date,
  pages: Number,
  language: String,
  rating: { average: Number, count: Number },
  tags: [String],
  isActive: Boolean,
  featured: Boolean,
  timestamps: true
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User),
  orderNumber: String (unique),
  items: [{
    book: ObjectId (ref: Book),
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: Object
  },
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  timestamps: true
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  id: "user_id",
  iat: "issued_at",
  exp: "expires_at"
}
```

### User Roles
- **User**: Can browse books, manage cart, place orders
- **Admin**: All user permissions plus book management and order administration

### Protected Routes
- **User routes**: Require valid JWT token
- **Admin routes**: Require JWT token with admin role

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Headers
```
Authorization: Bearer <jwt_token>
```

---

## 🔑 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890"
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Current User
```http
GET /api/auth/me
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Profile
```http
PUT /api/auth/profile
```
*Requires authentication*

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

### Change Password
```http
PUT /api/auth/change-password
```
*Requires authentication*

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

---

## 📚 Book Endpoints

### Get All Books
```http
GET /api/books
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `category` (optional): Filter by category
- `search` (optional): Search in title, author, description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `inStock` (optional): Filter books in stock (true/false)
- `sortBy` (optional): Sort field (title, author, price, createdAt, rating)
- `order` (optional): Sort order (asc, desc)

**Example:**
```http
GET /api/books?category=Fiction&search=Harry&page=1&limit=10&sortBy=price&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "_id": "book_id",
        "title": "Book Title",
        "author": "Author Name",
        "description": "Book description...",
        "price": 19.99,
        "image": "image_url",
        "category": "Fiction",
        "stock": 25,
        "isbn": "978-0123456789",
        "rating": { "average": 4.5, "count": 120 },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 100,
      "limit": 20
    }
  }
}
```

### Get Single Book
```http
GET /api/books/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "book_id",
    "title": "Book Title",
    "author": "Author Name",
    "description": "Detailed book description...",
    "price": 19.99,
    "image": "image_url",
    "category": "Fiction",
    "stock": 25,
    "isbn": "978-0123456789",
    "publisher": "Publisher Name",
    "publishedDate": "2023-01-01T00:00:00.000Z",
    "pages": 350,
    "language": "English",
    "rating": { "average": 4.5, "count": 120 },
    "tags": ["fantasy", "adventure"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Featured Books
```http
GET /api/books/featured
```

### Get Book Categories
```http
GET /api/books/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Romance",
    "Sci-Fi"
  ]
}
```

### Search Books
```http
GET /api/books/search?q=search_term&limit=10
```

### Create Book (Admin Only)
```http
POST /api/books
```
*Requires admin authentication*

**Request Body:**
```json
{
  "title": "New Book Title",
  "author": "Author Name",
  "description": "Book description...",
  "price": 24.99,
  "category": "Fiction",
  "stock": 50,
  "isbn": "978-0987654321",
  "publisher": "Publisher Name",
  "publishedDate": "2024-01-01",
  "pages": 400,
  "language": "English",
  "tags": ["fantasy", "adventure"],
  "featured": false
}
```

### Update Book (Admin Only)
```http
PUT /api/books/:id
```
*Requires admin authentication*

### Delete Book (Admin Only)
```http
DELETE /api/books/:id
```
*Requires admin authentication*

### Update Book Stock (Admin Only)
```http
PATCH /api/books/:id/stock
```
*Requires admin authentication*

**Request Body:**
```json
{
  "stock": 100
}
```

### Toggle Featured Status (Admin Only)
```http
PATCH /api/books/:id/featured
```
*Requires admin authentication*

---

## 🛒 Order Endpoints

### Create Order
```http
POST /api/orders
```
*Requires authentication*

**Request Body:**
```json
{
  "items": [
    {
      "book": "book_id_1",
      "quantity": 2
    },
    {
      "book": "book_id_2",
      "quantity": 1
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    }
  },
  "paymentMethod": "Credit Card",
  "notes": "Please handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-1704067200000-123",
    "user": "user_id",
    "items": [
      {
        "book": {
          "_id": "book_id",
          "title": "Book Title",
          "author": "Author Name",
          "price": 19.99
        },
        "quantity": 2,
        "price": 19.99
      }
    ],
    "subtotal": 39.98,
    "tax": 3.20,
    "shipping": 0,
    "total": 43.18,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Orders
```http
GET /api/orders
```
*Requires authentication*

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by order status

### Get Single Order
```http
GET /api/orders/:id
```
*Requires authentication*

### Cancel Order
```http
PUT /api/orders/:id/cancel
```
*Requires authentication*

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

---

## 🔧 Admin Order Endpoints

### Get All Orders (Admin)
```http
GET /api/orders/admin/all
```
*Requires admin authentication*

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by order status

### Update Order Status (Admin)
```http
PUT /api/orders/admin/:id/status
```
*Requires admin authentication*

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Available Statuses:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed, preparing for processing
- `processing` - Order being prepared
- `shipped` - Order shipped to customer
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

### Get Order Statistics (Admin)
```http
GET /api/orders/admin/stats
```
*Requires admin authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "statusStats": [
      { "_id": "pending", "count": 15, "totalAmount": 1500.00 },
      { "_id": "shipped", "count": 25, "totalAmount": 2750.00 }
    ],
    "totalOrders": 100,
    "totalRevenue": 12500.00,
    "recentOrders": [...]
  }
}
```

### Update Tracking Information (Admin)
```http
PUT /api/orders/admin/:id/tracking
```
*Requires admin authentication*

**Request Body:**
```json
{
  "trackingNumber": "1Z999AA1234567890",
  "estimatedDelivery": "2024-01-15T00:00:00.000Z"
}
```

---

## 📊 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🎨 Frontend Components

### Key Components
- **Navbar** - Navigation with cart and user menu
- **BookList** - Grid display of books with filtering
- **BookCard** - Individual book display component
- **BookDetail** - Detailed book view
- **CartDrawer** - Sliding cart sidebar
- **Login/Register** - Authentication forms

### Context Providers
- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state

### Custom Hooks
- **useAuth** - Authentication utilities
- **useCart** - Cart management utilities

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevents API abuse
- **CORS Configuration** - Cross-origin request security
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - MongoDB and Mongoose protection
- **XSS Protection** - Helmet security headers

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to platforms like:
- Vercel
- Netlify
- GitHub Pages

### Backend Deployment
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email sanisleakono@gmail.com .

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- MongoDB team
- Tailwind CSS team
- Shadcn/UI for beautiful components

---

**Happy Reading! 📚✨**
