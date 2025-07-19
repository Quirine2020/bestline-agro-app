import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Context for managing global state and API interactions
const AppContext = createContext();

// Base URL for your Netlify Functions API
// In production, this will be your site's URL (e.g., https://bestlinesuppliers.wuaze.com)
// In development, it's usually localhost:8888 if you're running Netlify Dev
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8888/.netlify/functions' : window.location.origin + '/.netlify/functions';

const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]); // Will be populated from DB
  const [products, setProducts] = useState([]); // Will be populated from DB
  const [orders, setOrders] = useState([]); // Will be populated from DB
  const [sales, setSales] = useState([]); // Will be populated from DB
  const [purchases, setPurchases] = useState([]); // Will be populated from DB
  const [expenses, setExpenses] = useState([]); // Will be populated from DB
  const [assets, setAssets] = useState([]); // Will be populated from DB
  const [liabilities, setLiabilities] = useState([]); // Will be populated from DB

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState('home');

  // --- API Helper Function ---
  const callApi = useCallback(async (endpoint, method = 'GET', body = null) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if you implement token-based auth later
        },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else if (response.ok) {
        // If not JSON but response is OK, it might be an empty response or unexpected format
        console.warn(`Received non-JSON response from ${endpoint}, but status is OK. Content-Type: ${contentType}`);
        return {}; // Return empty object or handle as appropriate
      } else {
        // Attempt to parse error message if available, otherwise use status text
        const errorText = await response.text();
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (parseError) {
          // If errorText is not JSON, use it directly or fall back
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("API Call Error:", err);
      setError(err.message || "An unexpected error occurred.");
      throw err; // Re-throw to allow specific error handling in components
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Initial Data Fetching (on component mount) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all initial data from your Netlify Functions
        // IMPORTANT: For these API calls to work, you MUST have corresponding Netlify Functions
        // (e.g., netlify/functions/users.js, netlify/functions/products.js, etc.)
        // that return JSON data. If these functions are missing or return HTML (e.g., a 404 page),
        // you will get "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" errors.
        const [fetchedUsers, fetchedProducts, fetchedOrders, fetchedSales, fetchedPurchases, fetchedExpenses, fetchedAssets, fetchedLiabilities] = await Promise.all([
          callApi('/users'),
          callApi('/products'),
          callApi('/orders'),
          callApi('/sales'),
          callApi('/purchases'),
          callApi('/expenses'),
          callApi('/assets'),
          callApi('/liabilities'),
        ]);

        setUsers(fetchedUsers);
        setProducts(fetchedProducts);
        setOrders(fetchedOrders);
        setSales(fetchedSales);
        setPurchases(fetchedPurchases);
        setExpenses(fetchedExpenses);
        setAssets(fetchedAssets);
        setLiabilities(fetchedLiabilities);

      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load initial data. Please ensure all Netlify Functions are deployed and correctly configured. Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [callApi]); // Dependency on callApi to ensure it's stable

  // --- Utility Functions (now interacting with API) ---
  const getProductById = useCallback((id) => products.find(p => p.id === id), [products]);
  const getUserById = useCallback((id) => users.find(u => u.id === id), [users]);

  const calculateCurrentValue = useCallback((asset) => {
    const purchaseYear = new Date(asset.purchaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsDepreciated = currentYear - purchaseYear;
    return asset.purchaseValue * Math.pow((1 - asset.depreciationRate), yearsDepreciated);
  }, []);

  const getCustomerDebts = useCallback(() => {
    return sales.filter(sale => sale.isCredit && !sale.paid).map(sale => ({
      ...sale,
      productName: getProductById(sale.productId)?.name || 'Unknown Product',
      isOverdue: sale.dueDate && new Date(sale.dueDate) < new Date()
    }));
  }, [sales, getProductById]);

  const getSupplierDebts = useCallback(() => {
    return purchases.filter(purchase => purchase.isCredit && !purchase.paid).map(purchase => ({
      ...purchase,
      productName: getProductById(purchase.productId)?.name || 'Unknown Product',
      isOverdue: purchase.dueDate && new Date(purchase.dueDate) < new Date()
    }));
  }, [purchases, getProductById]);

  // --- Authentication Functions (now interacting with API) ---
  const login = useCallback(async (username, password) => {
    try {
      const data = await callApi('/login', 'POST', { username, password });
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.role === 'client') {
          setCurrentPage('client-dashboard');
        } else {
          setCurrentPage('admin-dashboard');
        }
        return true;
      }
      return false;
    } catch (err) {
      // Error message already set by callApi
      return false;
    }
  }, [callApi]);

  const signup = useCallback(async (newUser) => {
    try {
      const data = await callApi('/signup', 'POST', newUser);
      if (data.user) {
        setUsers(prev => [...prev, data.user]); // Update local state
        setCurrentUser(data.user);
        setCurrentPage('client-dashboard');
        return true;
      }
      return false;
    } catch (err) {
      // Error message already set by callApi
      return false;
    }
  }, [callApi]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('home');
    // In a real app, you might also call a logout API to invalidate sessions
  }, []);

  // --- Data Management Functions (now interacting with API) ---
  const addProduct = useCallback(async (newProduct) => {
    try {
      const data = await callApi('/products', 'POST', newProduct);
      setProducts(prev => [...prev, data.product]);
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const updateProduct = useCallback(async (updatedProduct) => {
    try {
      const data = await callApi(`/products/${updatedProduct.id}`, 'PUT', updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data.product : p));
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const deleteProduct = useCallback(async (id) => {
    try {
      await callApi(`/products/${id}`, 'DELETE');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const placeOrder = useCallback(async (clientId, items) => {
    try {
      const data = await callApi('/orders', 'POST', { clientId, items });
      setOrders(prev => [...prev, data.order]);

      // Update local stock for products involved in the order
      items.forEach(item => {
        setProducts(prev => prev.map(p =>
          p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
        ));
      });
      return data.order;
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const data = await callApi(`/orders/${orderId}`, 'PUT', { status: newStatus });
      setOrders(prev => prev.map(order => order.id === orderId ? data.order : order));
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const recordSale = useCallback(async (newSale) => {
    try {
      const data = await callApi('/sales', 'POST', newSale);
      setSales(prev => [...prev, data.sale]);
      // Update local stock for walk-in sales
      if (newSale.type === 'walk-in') {
        setProducts(prev => prev.map(p =>
          p.id === newSale.productId ? { ...p, stock: p.stock - newSale.quantity } : p
        ));
      }
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const recordPurchase = useCallback(async (newPurchase) => {
    try {
      const data = await callApi('/purchases', 'POST', newPurchase);
      setPurchases(prev => [...prev, data.purchase]);
      // Update local stock
      setProducts(prev => prev.map(p =>
        p.id === newPurchase.productId ? { ...p, stock: p.stock + newPurchase.quantity } : p
      ));
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const addExpense = useCallback(async (newExpense) => {
    try {
      const data = await callApi('/expenses', 'POST', newExpense);
      setExpenses(prev => [...prev, data.expense]);
    } catch (err) /* handled by callApi */ { }
  }, [callApi]);

  const addAsset = useCallback(async (newAsset) => {
    try {
      const data = await callApi('/assets', 'POST', newAsset);
      setAssets(prev => [...prev, data.asset]);
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const addLiability = useCallback(async (newLiability) => {
    try {
      const data = await callApi('/liabilities', 'POST', newLiability);
      setLiabilities(prev => [...prev, data.liability]);
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const markCustomerDebtPaid = useCallback(async (saleId) => {
    try {
      const data = await callApi(`/sales/${saleId}/markPaid`, 'PUT');
      setSales(prev => prev.map(sale => sale.id === saleId ? data.sale : sale));
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const markSupplierDebtPaid = useCallback(async (purchaseId) => {
    try {
      const data = await callApi(`/purchases/${purchaseId}/markPaid`, 'PUT');
      setPurchases(prev => prev.map(purchase => purchase.id === purchaseId ? data.purchase : purchase));
    } catch (err) { /* handled by callApi */ }
  }, [callApi]);

  const updateUserProfile = useCallback(async (userId, updatedInfo) => {
    try {
      const data = await callApi(`/users/${userId}`, 'PUT', updatedInfo);
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(data.user);
      }
    } catch (err) { /* handled by callApi */ }
  }, [callApi, currentUser]);

  const deleteUser = useCallback(async (userIdToDelete) => {
    try {
      await callApi(`/users/${userIdToDelete}`, 'DELETE');
      setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
      if (currentUser && currentUser.id === userIdToDelete) {
        setCurrentUser(null);
        setCurrentPage('home');
      }
    } catch (err) { /* handled by callApi */ }
  }, [callApi, currentUser]);


  const state = {
    currentUser, setCurrentUser, login, signup, logout,
    products, setProducts, addProduct, updateProduct, deleteProduct, getProductById,
    users, getUserById, updateUserProfile, deleteUser,
    orders, setOrders, placeOrder, updateOrderStatus,
    sales, setSales, recordSale,
    purchases, setPurchases, recordPurchase,
    expenses, setExpenses, addExpense,
    assets, setAssets, addAsset, calculateCurrentValue,
    liabilities, setLiabilities, addLiability,
    getCustomerDebts, markCustomerDebtPaid,
    getSupplierDebts, markSupplierDebtPaid,
    currentPage, setCurrentPage,
    loading, error // Expose loading and error states
  };

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
};

// --- Reusable UI Components ---

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
    {title && <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>}
    {children}
  </div>
);

const Button = ({ onClick, children, className = 'bg-green-600 hover:bg-green-700', disabled = false, type = 'button' }) => (
  <button
    onClick={onClick}
    type={type}
    className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={disabled}
  >
    {children}
  </button>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, className = '', min, max, required = false, name }) => (
  <div className="mb-4">
    {label && <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
      min={min}
      max={max}
      required={required}
      name={name}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = '', required = false, name }) => (
  <div className="mb-4">
    {label && <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
      required={required}
      name={name}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const Table = ({ headers, data, renderRow }) => (
  <div className="overflow-x-auto rounded-lg shadow-md">
    <table className="min-w-full bg-white">
      <thead className="bg-gray-200">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.length > 0 ? (
          data.map(renderRow)
        ) : (
          <tr>
            <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">No data available.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- Public Website Components ---

const Homepage = () => {
  const { setCurrentPage, products, loading, error } = useContext(AppContext);
  const featuredProducts = products.slice(0, 3); // Show first 3 as featured

  if (loading) return <p className="text-center p-8">Loading products...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="text-center py-12 md:py-20 bg-gradient-to-b from-green-50 to-white">
      <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4">
        Welcome to BestLine
      </h2>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
        “Reliable Chemicals, Sustainable Harvests.”
      </p>
      <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto">
        Your trusted partner in agricultural chemicals, providing high-quality fertilizers, herbicides, and pesticides for bountiful yields.
      </p>

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
        <Button onClick={() => setCurrentPage('products')} className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
          View Products
        </Button>
        <Button onClick={() => setCurrentPage('signup')} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
          Sign Up
        </Button>
        <Button onClick={() => setCurrentPage('contact')} className="bg-gray-600 hover:bg-gray-700 px-8 py-3 text-lg">
          Contact Us
        </Button>
      </div>

      <h3 className="text-3xl font-bold text-green-800 mb-8">Featured Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
        {featuredProducts.map(product => (
          <Card key={product.id} className="transform transition duration-300 hover:scale-105">
            <h4 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h4>
            <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
            <p className="text-green-700 font-bold text-xl mb-2">Ksh {product.price.toLocaleString()}</p>
            <Button onClick={() => setCurrentPage('products')} className="w-full">Learn More</Button>
          </Card>
        ))}
      </div>

      <h3 className="text-3xl font-bold text-green-800 mb-8">Thriving Harvests with BestLine</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/cabbages.jpeg" // Updated path for cabbages
            alt="Vibrant Cabbages"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Healthy Cabbage Field</p>
        </div>
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/pineapples.jpeg" // Updated path for pineapples
            alt="Fresh Pineapples"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Fresh Pineapple Harvest</p>
        </div>
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/rose flowers.jpeg" // Updated path for rose flowers with space
            alt="Beautiful Rose Flowers"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Lush Rose Farm</p>
        </div>
      </div>
    </div>
  );
};

const AboutUsPage = () => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md my-8">
    <h2 className="text-3xl font-bold text-green-800 mb-6">About BestLine</h2>
    <p className="text-lg text-gray-700 mb-4">
      At BestLine, our mission is to empower farmers with the highest quality agricultural chemicals, fostering sustainable practices and ensuring abundant harvests. We believe in providing reliable solutions that contribute to food security and economic growth in the agricultural sector.
    </p>
    <h3 className="text-2xl font-semibold text-green-700 mb-4">Our Vision</h3>
    <p className="text-gray-700 mb-4">
      To be the leading supplier of innovative and environmentally responsible agro-chemicals, recognized for our commitment to quality, customer satisfaction, and agricultural sustainability across the region.
    </p>
    <h3 className="text-2xl font-semibold text-green-700 mb-4">Company Background</h3>
    <p className="text-gray-700 mb-4">
      Founded in [Year], BestLine started with a simple goal: to bridge the gap between advanced agricultural science and local farming needs. Over the years, we have grown into a trusted name, building strong relationships with both international suppliers and local farmers. Our team comprises agricultural experts dedicated to understanding your challenges and providing tailored solutions. We pride ourselves on our rigorous quality control, ethical sourcing, and commitment to delivering products that truly make a difference.
    </p>
    <p className="text-gray-700">
      We are more than just a supplier; we are partners in your success, striving for "Reliable Chemicals, Sustainable Harvests."
    </p>
  </div>
);

const ProductsPage = () => {
  const { products, setCurrentPage, currentUser, loading, error } = useContext(AppContext);
  const [filterCategory, setFilterCategory] = useState('All');
  const productCategories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = filterCategory === 'All'
    ? products
    : products.filter(p => p.category === filterCategory);

  if (loading) return <p className="text-center p-8">Loading products...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;


  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Our Products</h2>

      <div className="mb-6 flex flex-wrap items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <label htmlFor="category-filter" className="font-semibold text-gray-700">Filter by Category:</label>
        <Select
          id="category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={productCategories.map(cat => ({ value: cat, label: cat }))}
          className="w-full sm:w-auto"
        />
        {currentUser && currentUser.role === 'client' && (
          <Button onClick={() => setCurrentPage('client-dashboard-place-order')} className="ml-auto bg-blue-600 hover:bg-blue-700">
            Place New Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="flex flex-col justify-between">
            <div>
              <h4 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h4>
              <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
              <p className="text-gray-600 mb-4 line-clamp-4">{product.description}</p>
              <p className="text-green-700 font-bold text-xl mb-2">Ksh {product.price.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">Availability: {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}</p>
            </div>
            {currentUser && currentUser.role === 'client' && product.stock > 0 && (
              <Button onClick={() => setCurrentPage('client-dashboard-place-order')} className="mt-4 w-full">
                Order Now
              </Button>
            )}
            {!currentUser && (
              <Button onClick={() => setCurrentPage('login')} className="mt-4 w-full bg-blue-500 hover:bg-blue-600">
                Login to Order
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

const ContactUsPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitMessage('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitMessage(''), 5000); // Clear message after 5 seconds
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md my-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Contact Us</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Get in Touch</h3>
          <p className="text-gray-700 mb-4">
            Have questions about our products or services? Feel free to reach out to us using the form below or through our contact details.
          </p>
          {submitMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
              {submitMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Input label="Your Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Your Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Details</h3>
          <p className="text-gray-700 mb-2">
            <i className="fas fa-map-marker-alt mr-2"></i> 123 Agro-Chem Road, Industrial Area, Nairobi, Kenya
          </p>
          <p className="text-gray-700 mb-2">
            <i className="fas fa-phone mr-2"></i> +254 712 345 678
          </p>
          <p className="text-gray-700 mb-2">
            <i className="fas fa-envelope mr-2"></i> info@bestline.co.ke
          </p>
          <div className="mt-4">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Follow Us</h4>
            <div onClick={() => window.open('https://facebook.com/bestlineagro', '_blank')} className="text-blue-600 hover:text-blue-800 cursor-pointer"><i className="fab fa-facebook"></i></div>
            <div onClick={() => window.open('https://twitter.com/bestlineagro', '_blank')} className="text-blue-400 hover:text-blue-600 cursor-pointer"><i className="fab fa-twitter"></i></div>
            <div onClick={() => window.open('https://instagram.com/bestlineagro', '_blank')} className="text-red-600 hover:text-red-800 cursor-pointer"><i className="fab fa-instagram"></i></div>
            <div onClick={() => window.open('https://linkedin.com/company/bestlineagro', '_blank')} className="text-blue-700 hover:text-blue-900 cursor-pointer"><i className="fab fa-linkedin"></i></div>
          </div>
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Our Location</h4>
            <div className="bg-gray-200 h-48 rounded-md flex items-center justify-center text-gray-600">
              [Google Map Placeholder]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthForm = ({ type }) => {
  const { login, signup, setCurrentPage, loading, error } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmType, setFarmType] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [authError, setAuthError] = useState(''); // Specific error for auth form

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (type === 'login') {
      const success = await login(username, password);
      if (!success) {
        setAuthError(error || 'Invalid username or password.'); // Use global error if available, else generic
      }
    } else { // signup
      const success = await signup({ username, password, name, farmType, location, contactInfo });
      if (!success) {
        setAuthError(error || 'Username already exists or signup failed.');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto bg-white rounded-lg shadow-md my-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">{type === 'login' ? 'Login to Your Account' : 'Create New Account'}</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {type === 'signup' && (
          <>
            <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Farm Type (e.g., Mixed, Crop, Livestock)" type="text" value={farmType} onChange={(e) => setFarmType(e.target.value)} />
            <Input label="Location (Town/District)" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
            <Input label="Contact Info (Email/Phone)" type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
          </>
        )}

        {(authError || error) && <p className="text-red-500 text-sm mb-4">{authError || error}</p>}
        {loading && <p className="text-blue-500 text-sm mb-4">Processing...</p>}

        <Button type="submit" className="w-full mb-4" disabled={loading}>
          {type === 'login' ? 'Login' : 'Sign Up'}
        </Button>

        {type === 'login' ? (
          <p className="text-center text-gray-600">
            Don't have an account? <button type="button" onClick={() => setCurrentPage('signup')} className="text-blue-600 hover:underline">Sign Up</button>
          </p>
        ) : (
          <p className="text-center text-gray-600">
            Already have an account? <button type="button" onClick={() => setCurrentPage('login')} className="text-blue-600 hover:underline">Login</button>
          </p>
        )}
      </form>
    </div>
  );
};

// --- Client Profile Dashboard Components ---

const ClientDashboard = () => {
  const { currentUser } = useContext(AppContext);

  if (!currentUser || currentUser.role !== 'client') {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as a client.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Welcome, {currentUser.name}!</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Your Profile" className="bg-blue-50">
          <p><strong>Farm Type:</strong> {currentUser.farmType || 'N/A'}</p>
          <p><strong>Location:</strong> {currentUser.location || 'N/A'}</p>
          <p><strong>Contact:</strong> {currentUser.contactInfo || 'N/A'}</p>
          <Button onClick={() => setCurrentPage('client-dashboard-profile')} className="mt-4 bg-indigo-600 hover:bg-indigo-700">Edit Profile</Button>
        </Card>
        <Card title="New Order" className="bg-green-50">
          <p>Browse our products and place a new order.</p>
          <Button onClick={() => setCurrentPage('client-dashboard-place-order')} className="mt-4 bg-blue-600 hover:bg-blue-700">Place Order</Button>
        </Card>
        <Card title="Order History" className="bg-yellow-50">
          <p>View your past orders and track their status.</p>
          <Button onClick={() => setCurrentPage('client-dashboard-order-history')} className="mt-4 bg-orange-600 hover:bg-orange-700">View History</Button>
        </Card>
      </div>
    </div>
  );
};

const ClientOrderHistory = () => {
  const { currentUser, orders, getProductById, loading, error } = useContext(AppContext);
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'client') return null;

  const clientOrders = orders.filter(order => order.clientId === currentUser.id);

  const handleDownloadInvoice = (order) => {
    setMessage(`Invoice for Order ID: ${order.id}\nStatus: ${order.status}\nTotal: Ksh ${order.totalAmount.toLocaleString()}\n\nItems:\n${order.items.map(item => `${getProductById(item.productId)?.name || 'N/A'} x ${item.quantity} @ Ksh ${item.unitPrice}`).join('\n')}`);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  if (loading) return <p className="text-center p-8">Loading order history...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading orders: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Your Order History</h2>
      <Card>
        {message && (
          <div className="p-3 bg-blue-100 text-blue-700 rounded-md mb-4 whitespace-pre-wrap">
            {message}
          </div>
        )}
        <Table
          headers={['Order ID', 'Date', 'Items', 'Total Amount (Ksh)', 'Status', 'Invoice']}
          data={clientOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))}
          renderRow={(order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <ul className="list-disc list-inside">
                  {order.items.map((item, idx) => {
                    const product = getProductById(item.productId);
                    return <li key={idx}>{product ? product.name : 'Unknown'} x {item.quantity}</li>;
                  })}
                </ul>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {order.totalAmount.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => handleDownloadInvoice(order)} className="bg-purple-600 hover:bg-purple-700">View Invoice</Button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

const PlaceNewOrder = () => {
  const { currentUser, products, placeOrder, loading, error } = useContext(AppContext);
  const [selectedProducts, setSelectedProducts] = useState({}); // { productId: quantity }
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'client') return null;

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(prev => {
      const newQuantity = parseInt(quantity);
      if (newQuantity <= 0 || isNaN(newQuantity)) {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setMessage('');
    const itemsToOrder = Object.entries(selectedProducts)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product || quantity > product.stock) {
          setMessage(`Error: Not enough stock for ${product?.name || 'Unknown Product'} or product not found.`);
          return null;
        }
        return { productId, quantity, unitPrice: product.price };
      })
      .filter(Boolean); // Remove nulls (products with errors)

    if (itemsToOrder.length === 0) {
      setMessage('Please select products and quantities to place an order.');
      return;
    }

    if (itemsToOrder.length !== Object.keys(selectedProducts).length) {
      // Some products had issues, message already set
      return;
    }

    try {
      const newOrder = await placeOrder(currentUser.id, itemsToOrder);
      setMessage(`Order ${newOrder.id} placed successfully! Total: Ksh ${newOrder.totalAmount.toLocaleString()}. Status: ${newOrder.status}`);
      setSelectedProducts({}); // Clear cart
    } catch (err) {
      setMessage(`Failed to place order: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  if (loading) return <p className="text-center p-8">Loading products for order...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading products: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Place New Order</h2>

      <Card title="Select Products">
        {message && (
          <div className={`p-3 rounded-md mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmitOrder}>
          <Table
            headers={['Product Name', 'Category', 'Price (Ksh)', 'Stock', 'Quantity to Order']}
            data={products.filter(p => p.stock > 0)} // Only show available products
            renderRow={(product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {product.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Input
                    type="number"
                    value={selectedProducts[product.id] || ''}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    min="0"
                    max={product.stock}
                    className="w-24 py-1 px-2 text-sm"
                  />
                </td>
              </tr>
            )}
          />
          <div className="mt-6 text-right">
            <Button type="submit" disabled={Object.keys(selectedProducts).length === 0 || loading}>
              Submit Order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const ClientProfileManagement = () => {
  const { currentUser, updateUserProfile, loading, error } = useContext(AppContext);
  const [profileData, setProfileData] = useState({
    name: '', farmType: '', location: '', contactInfo: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        farmType: currentUser.farmType || '',
        location: currentUser.location || '',
        contactInfo: currentUser.contactInfo || ''
      });
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'client') return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(currentUser.id, profileData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(`Failed to update profile: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Manage Your Profile</h2>
      <Card>
        {message && <div className={`p-3 rounded-md mb-4 ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}
        {loading && <p className="text-blue-500 text-sm mb-4">Updating profile...</p>}
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={profileData.name} onChange={handleChange} required />
          <Input label="Farm Type (e.g., Mixed, Crop, Livestock)" name="farmType" value={profileData.farmType} onChange={handleChange} />
          <Input label="Location (Town/District)" name="location" value={profileData.location} onChange={handleChange} required />
          <Input label="Contact Info (Email/Phone)" name="contactInfo" value={profileData.contactInfo} onChange={handleChange} required />
          <Button type="submit" disabled={loading}>Update Profile</Button>
        </form>
      </Card>
    </div>
  );
};


// --- Admin Panel Components ---

const AdminDashboard = () => {
  const { products, sales, expenses, orders, getCustomerDebts, getSupplierDebts, currentUser, loading, error } = useContext(AppContext);

  if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as Admin or Manager.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading dashboard data...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading dashboard: {error}</p>;

  // KPIs
  const totalSalesValue = sales.reduce((sum, s) => sum + (s.quantity * s.unitPrice), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel);
  const expiringProducts = products.filter(p => new Date(p.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))); // Within 3 months
  const overdueCustomerDebts = getCustomerDebts().filter(debt => debt.isOverdue);
  const overdueSupplierDebts = getSupplierDebts().filter(debt => debt.isOverdue);

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Total Sales Value" className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-3xl font-bold">Ksh {totalSalesValue.toLocaleString()}</p>
        </Card>
        <Card title="Total Expenses" className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-3xl font-bold">Ksh {totalExpenses.toLocaleString()}</p>
        </Card>
        <Card title="Current Stock Value" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-3xl font-bold">Ksh {totalStockValue.toLocaleString()}</p>
        </Card>
        <Card title="Pending Client Orders" className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-3xl font-bold">{pendingOrders}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Stock Alerts">
          {lowStockProducts.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
              <h4 className="font-semibold mb-2">Low Stock Products:</h4>
              <ul className="list-disc list-inside">
                {lowStockProducts.map(p => (
                  <li key={p.id}>{p.name} (Current: {p.stock}, Reorder: {p.reorderLevel})</li>
                ))}
              </ul>
            </div>
          )}
          {expiringProducts.length > 0 && (
            <div className="p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded-md">
              <h4 className="font-semibold mb-2">Expiring Products (within 3 months):</h4>
              <ul className="list-disc list-inside">
                {expiringProducts.map(p => (
                  <li key={p.id}>{p.name} (Expires: {p.expiryDate})</li>
                ))}
              </ul>
            </div>
          )}
          {lowStockProducts.length === 0 && expiringProducts.length === 0 && (
            <p className="text-gray-600">No stock alerts at the moment.</p>
          )}
        </Card>

        <Card title="Debt Alerts">
          {overdueCustomerDebts.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <h4 className="font-semibold mb-2">Overdue Customer Debts:</h4>
              <ul className="list-disc list-inside">
                {overdueCustomerDebts.map(debt => (
                  <li key={debt.id}>{debt.customerName} - Ksh {debt.amountDue.toLocaleString()} (Due: {debt.dueDate})</li>
                ))}
              </ul>
            </div>
          )}
          {overdueSupplierDebts.length > 0 && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <h4 className="font-semibold mb-2">Overdue Supplier Debts:</h4>
              <ul className="list-disc list-inside">
                {overdueSupplierDebts.map(debt => (
                  <li key={debt.id}>{debt.supplierName} - Ksh {debt.amountDue.toLocaleString()} (Due: {debt.dueDate})</li>
                ))}
              </ul>
            </div>
          )}
          {overdueCustomerDebts.length === 0 && overdueSupplierDebts.length === 0 && (
            <p className="text-gray-600">No overdue debts.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

const AdminInventoryManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct, currentUser, loading, error } = useContext(AppContext);
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', category: 'Foliar Feeds', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: ''
  });
  const [formMessage, setFormMessage] = useState('');

  const productCategories = [
    { value: 'Foliar Feeds', label: 'Foliar Feeds' },
    { value: 'Fungicide', label: 'Fungicide' },
    { value: 'Pesticide', label: 'Pesticide' },
    { value: 'Other', label: 'Other' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), reorderLevel: parseInt(newProduct.reorderLevel) });
        setFormMessage('Product updated successfully!');
        setEditingProduct(null);
      } else {
        await addProduct({ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), reorderLevel: parseInt(newProduct.reorderLevel) });
        setFormMessage('Product added successfully!');
      }
      setNewProduct({ name: '', description: '', category: 'Foliar Feeds', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: '' });
      setShowAddEditForm(false);
    } catch (err) {
      setFormMessage(`Operation failed: ${err.message}`);
    }
    setTimeout(() => setFormMessage(''), 5000);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name, description: product.description, category: product.category,
      price: product.price.toString(), stock: product.stock.toString(), reorderLevel: product.reorderLevel.toString(),
      batch: product.batch, expiryDate: product.expiryDate, supplierInfo: product.supplierInfo
    });
    setShowAddEditForm(true);
    setFormMessage('');
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setFormMessage('Product deleted successfully!');
      } catch (err) {
        setFormMessage(`Failed to delete product: ${err.message}`);
      }
      setTimeout(() => setFormMessage(''), 5000);
    }
  };

  const canManage = currentUser && ['admin', 'manager'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin or Manager can access Inventory.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading inventory...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading inventory: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Inventory Management</h2>

      <div className="mb-6">
        <Button onClick={() => { setShowAddEditForm(true); setEditingProduct(null); setNewProduct({ name: '', description: '', category: 'Foliar Feeds', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: '' }); setFormMessage(''); }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </Button>
      </div>

      {formMessage && (
        <div className={`p-3 rounded-md mb-4 ${formMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {formMessage}
        </div>
      )}

      {showAddEditForm && (
        <Card title={editingProduct ? 'Edit Product' : 'Add New Product'} className="mb-8">
          <form onSubmit={handleSubmit}>
            <Input label="Product Name" name="name" value={newProduct.name} onChange={handleInputChange} required />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
              <textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required></textarea>
            </div>
            <Select label="Category" name="category" value={newProduct.category} onChange={handleInputChange} options={productCategories} />
            <Input label="Price (Ksh)" name="price" type="number" value={newProduct.price} onChange={handleInputChange} min="0" required />
            <Input label="Current Stock" name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} min="0" required />
            <Input label="Reorder Level" name="reorderLevel" type="number" value={newProduct.reorderLevel} onChange={handleInputChange} min="0" required />
            <Input label="Batch Number" name="batch" value={newProduct.batch} onChange={handleInputChange} required />
            <Input label="Expiry Date" name="expiryDate" type="date" value={newProduct.expiryDate} onChange={handleInputChange} required />
            <Input label="Supplier Info" name="supplierInfo" value={newProduct.supplierInfo} onChange={handleInputChange} />
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>{editingProduct ? 'Update Product' : 'Add Product'}</Button>
              <Button type="button" onClick={() => setShowAddEditForm(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Product List">
        <Table
          headers={['Name', 'Category', 'Price', 'Stock', 'Reorder', 'Batch', 'Expiry', 'Status', 'Actions']}
          data={products}
          renderRow={(product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {product.price.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.reorderLevel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.batch}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.expiryDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {product.stock <= product.reorderLevel && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>}
                {new Date(product.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3)) && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Expiring Soon</span>}
                {product.stock > product.reorderLevel && new Date(product.expiryDate) >= new Date(new Date().setMonth(new Date().getMonth() + 3)) && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Good</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => handleEditClick(product)} className="bg-indigo-600 hover:bg-indigo-700 mr-2" disabled={loading}>Edit</Button>
                <Button onClick={() => handleDeleteClick(product.id)} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete</Button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

const AdminSalesPurchases = () => {
  const { products, sales, purchases, recordSale, recordPurchase, getProductById, currentUser, loading, error } = useContext(AppContext);
  const [showAddSaleForm, setShowAddSaleForm] = useState(false);
  const [showAddPurchaseForm, setShowAddPurchaseForm] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [newSale, setNewSale] = useState({
    type: 'walk-in', customerName: '', productId: '', quantity: '', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0], isCredit: false, amountDue: '', dueDate: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    supplierName: '', productId: '', quantity: '', cost: '', date: new Date().toISOString().split('T')[0], isCredit: false, amountDue: '', dueDate: ''
  });

  const handleSaleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSale(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePurchaseInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPurchase(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    const product = getProductById(newSale.productId);
    if (!product) { setFormMessage('Error: Product not found.'); return; }
    if (parseInt(newSale.quantity) > product.stock) { setFormMessage('Error: Quantity exceeds stock!'); return; }

    const saleData = {
      ...newSale,
      quantity: parseInt(newSale.quantity),
      unitPrice: product.price,
      amountDue: newSale.isCredit ? (parseInt(newSale.quantity) * product.price) : 0,
      paid: !newSale.isCredit,
    };
    try {
      await recordSale(saleData);
      setFormMessage('Sale recorded successfully!');
      setNewSale({ type: 'walk-in', customerName: '', productId: '', quantity: '', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0], isCredit: false, amountDue: '', dueDate: '' });
      setShowAddSaleForm(false);
    } catch (err) {
      setFormMessage(`Failed to record sale: ${err.message}`);
    }
    setTimeout(() => setFormMessage(''), 5000);
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    const purchaseData = {
      ...newPurchase,
      quantity: parseInt(newPurchase.quantity),
      cost: parseFloat(newPurchase.cost),
      amountDue: newPurchase.isCredit ? (parseInt(newPurchase.quantity) * parseFloat(newPurchase.cost)) : 0,
      paid: !newPurchase.isCredit,
    };
    try {
      await recordPurchase(purchaseData);
      setFormMessage('Purchase recorded successfully!');
      setNewPurchase({ supplierName: '', productId: '', quantity: '', cost: '', date: new Date().toISOString().split('T')[0], isCredit: false, amountDue: '', dueDate: '' });
      setShowAddPurchaseForm(false);
    } catch (err) {
      setFormMessage(`Failed to record purchase: ${err.message}`);
    }
    setTimeout(() => setFormMessage(''), 5000);
  };

  const canRecord = currentUser && ['admin', 'manager', 'cashier'].includes(currentUser.role);
  const canManagePurchases = currentUser && ['admin', 'manager'].includes(currentUser.role);

  if (!canRecord) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Cashier can access Sales/Purchases.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading sales and purchases...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading data: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Sales & Purchase Transactions</h2>

      <div className="mb-6 flex space-x-4">
        <Button onClick={() => { setShowAddSaleForm(true); setFormMessage(''); }}>Record New Sale</Button>
        {canManagePurchases && <Button onClick={() => { setShowAddPurchaseForm(true); setFormMessage(''); }} className="bg-blue-600 hover:bg-blue-700">Record New Purchase</Button>}
      </div>

      {formMessage && (
        <div className={`p-3 rounded-md mb-4 ${formMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {formMessage}
        </div>
      )}

      {showAddSaleForm && (
        <Card title="Record New Sale" className="mb-8">
          <form onSubmit={handleSaleSubmit}>
            <Select
              label="Sale Type" name="type" value={newSale.type} onChange={handleSaleInputChange}
              options={[{ value: 'walk-in', label: 'Walk-in' }, { value: 'online', label: 'Online Order (Simulated)' }]}
            />
            <Input label="Customer Name" name="customerName" value={newSale.customerName} onChange={handleSaleInputChange} required />
            <Select
              label="Product" name="productId" value={newSale.productId} onChange={handleSaleInputChange} required
              options={[{ value: '', label: 'Select a product' }, ...products.map(p => ({ value: p.id, label: `${p.name} (Stock: ${p.stock})` }))]}
            />
            <Input label="Quantity" name="quantity" type="number" value={newSale.quantity} onChange={handleSaleInputChange} min="1" required />
            <Select
              label="Payment Method" name="paymentMethod" value={newSale.paymentMethod} onChange={handleSaleInputChange}
              options={[{ value: 'Cash', label: 'Cash' }, { value: 'M-Pesa', label: 'M-Pesa' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit', label: 'Credit' }]}
            />
            <Input label="Date" name="date" type="date" value={newSale.date} onChange={handleSaleInputChange} required />
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" name="isCredit" checked={newSale.isCredit} onChange={handleSaleInputChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
                <span className="ml-2 text-gray-700">Credit Sale</span>
              </label>
            </div>
            {newSale.isCredit && (
              <Input label="Due Date" name="dueDate" type="date" value={newSale.dueDate} onChange={handleSaleInputChange} required={newSale.isCredit} />
            )}
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>Record Sale</Button>
              <Button type="button" onClick={() => setShowAddSaleForm(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {showAddPurchaseForm && canManagePurchases && (
        <Card title="Record New Purchase" className="mb-8">
          <form onSubmit={handlePurchaseSubmit}>
            <Input label="Supplier Name" name="supplierName" value={newPurchase.supplierName} onChange={handlePurchaseInputChange} required />
            <Select
              label="Product" name="productId" value={newPurchase.productId} onChange={handlePurchaseInputChange} required
              options={[{ value: '', label: 'Select a product' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
            />
            <Input label="Quantity" name="quantity" type="number" value={newPurchase.quantity} onChange={handlePurchaseInputChange} min="1" required />
            <Input label="Cost per Unit (Ksh)" name="cost" type="number" value={newPurchase.cost} onChange={handlePurchaseInputChange} min="0" required />
            <Input label="Date" name="date" type="date" value={newPurchase.date} onChange={handlePurchaseInputChange} required />
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" name="isCredit" checked={newPurchase.isCredit} onChange={handlePurchaseInputChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
                <span className="ml-2 text-gray-700">Credit Purchase</span>
              </label>
            </div>
            {newPurchase.isCredit && (
              <Input label="Due Date" name="dueDate" type="date" value={newPurchase.dueDate} onChange={handlePurchaseInputChange} required={newPurchase.isCredit} />
            )}
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>Record Purchase</Button>
              <Button type="button" onClick={() => setShowAddPurchaseForm(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Sales History" className="mb-8">
        <Table
          headers={['Date', 'Type', 'Customer', 'Product', 'Quantity', 'Unit Price', 'Total', 'Payment', 'Status']}
          data={sales.sort((a, b) => new Date(b.date) - new Date(a.date))}
          renderRow={(sale) => {
            const product = getProductById(sale.productId);
            const totalSalePrice = sale.quantity * sale.unitPrice;
            return (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sale.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product ? product.name : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {sale.unitPrice.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {totalSalePrice.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.paymentMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {sale.isCredit ? (sale.paid ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid (Credit)</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Credit Due</span>) : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Paid</span>}
                </td>
              </tr>
            );
          }}
        />
      </Card>

      {canManagePurchases && (
        <Card title="Purchase History">
          <Table
            headers={['Date', 'Supplier', 'Product', 'Quantity', 'Cost per Unit', 'Total Cost', 'Status']}
            data={purchases.sort((a, b) => new Date(b.date) - new Date(a.date))}
            renderRow={(purchase) => {
              const product = getProductById(purchase.productId);
              const totalPurchaseCost = purchase.quantity * purchase.cost;
              return (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product ? product.name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {purchase.cost.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {totalPurchaseCost.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {purchase.isCredit ? (purchase.paid ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid (Credit)</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Credit Due</span>) : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Paid</span>}
                  </td>
                </tr>
              );
            }}
          />
        </Card>
      )}
    </div>
  );
};

const AdminOrderManagement = () => {
  const { orders, updateOrderStatus, getProductById, getUserById, currentUser, loading, error } = useContext(AppContext);
  const [message, setMessage] = useState('');

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setMessage(`Order ${orderId} status updated to ${newStatus}.`);
    } catch (err) {
      setMessage(`Failed to update order status: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  const canManage = currentUser && ['admin', 'manager', 'customer-support'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin or Manager can access Order Management.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading orders...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading orders: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Client Order Management</h2>

      <Card title="All Client Orders">
        {message && (
          <div className={`p-3 rounded-md mb-4 ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        <Table
          headers={['Order ID', 'Client Name', 'Order Date', 'Items', 'Total Amount (Ksh)', 'Status', 'Actions']}
          data={orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))}
          renderRow={(order) => {
            const client = getUserById(order.clientId);
            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client ? client.name : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    {order.items.map((item, idx) => {
                      const product = getProductById(item.productId);
                      return <li key={idx}>{product ? product.name : 'Unknown'} x {item.quantity}</li>;
                    })}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {order.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Approved', label: 'Approved' },
                      { value: 'Dispatched', label: 'Dispatched' },
                      { value: 'Delivered', label: 'Delivered' },
                      { value: 'Rejected', label: 'Rejected' },
                    ]}
                    className="py-1 px-2 text-sm"
                    disabled={loading}
                  />
                </td>
              </tr>
            );
          }}
        />
      </Card>
    </div>
  );
};

const AdminExpensesTracking = () => {
  const { expenses, addExpense, currentUser, loading, error } = useContext(AppContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '', category: 'Transport', amount: '', date: new Date().toISOString().split('T')[0]
  });
  const [formMessage, setFormMessage] = useState('');

  const expenseCategories = [
    { value: 'Transport', label: 'Transport' },
    { value: 'Salaries', label: 'Salaries' },
    { value: 'Rent', label: 'Rent' },
    { value: 'Electricity', label: 'Electricity' },
    { value: 'Water', label: 'Water' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Other', label: 'Other' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      await addExpense({ ...newExpense, amount: parseFloat(newExpense.amount) });
      setFormMessage('Expense added successfully!');
      setNewExpense({ description: '', category: 'Transport', amount: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
    } catch (err) {
      setFormMessage(`Failed to add expense: ${err.message}`);
    }
    setTimeout(() => setFormMessage(''), 5000);
  };

  const canManage = currentUser && ['admin', 'manager', 'accountant'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Accountant can access Expenses.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading expenses...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading expenses: {error}</p>;

  // Group expenses by category for summary
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Expenses Tracking</h2>

      <div className="mb-6">
        <Button onClick={() => { setShowAddForm(true); setFormMessage(''); }}>Add New Expense</Button>
      </div>

      {formMessage && (
        <div className={`p-3 rounded-md mb-4 ${formMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {formMessage}
        </div>
      )}

      {showAddForm && (
        <Card title="Add New Expense" className="mb-8">
          <form onSubmit={handleSubmit}>
            <Input label="Description" name="description" value={newExpense.description} onChange={handleInputChange} required />
            <Select label="Category" name="category" value={newExpense.category} onChange={handleInputChange} options={expenseCategories} />
            <Input label="Amount (Ksh)" name="amount" type="number" value={newExpense.amount} onChange={handleInputChange} min="0" required />
            <Input label="Date" name="date" type="date" value={newExpense.date} onChange={handleInputChange} required />
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>Add Expense</Button>
              <Button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Expense Summary by Category" className="mb-8">
        <Table
          headers={['Category', 'Total Amount (Ksh)']}
          data={Object.entries(expensesByCategory)}
          renderRow={([category, total]) => (
            <tr key={category} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {total.toLocaleString()}</td>
            </tr>
          )}
        />
        <div className="mt-4 text-right text-lg font-bold text-gray-800">
          Total Expenses: Ksh {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
        </div>
      </Card>

      <Card title="All Expenses">
        <Table
          headers={['Date', 'Description', 'Category', 'Amount (Ksh)']}
          data={expenses.sort((a, b) => new Date(b.date) - new Date(a.date))}
          renderRow={(expense) => (
            <tr key={expense.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {expense.amount.toLocaleString()}</td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

const AdminAssetsLiabilitiesDebt = () => {
  const { assets, addAsset, calculateCurrentValue, liabilities, addLiability, getCustomerDebts, getSupplierDebts, markCustomerDebtPaid, markSupplierDebtPaid, currentUser, loading, error } = useContext(AppContext);
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '', purchaseValue: '', purchaseDate: new Date().toISOString().split('T')[0], depreciationRate: ''
  });
  const [showAddLiabilityForm, setShowAddLiabilityForm] = useState(false);
  const [newLiability, setNewLiability] = useState({
    name: '', type: 'Loan', amount: '', interestRate: '', repaymentDate: '', dueDate: ''
  });
  const [formMessage, setFormMessage] = useState('');

  const customerDebts = getCustomerDebts();
  const supplierDebts = getSupplierDebts();

  const handleAssetInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      await addAsset({
        ...newAsset,
        purchaseValue: parseFloat(newAsset.purchaseValue),
        depreciationRate: parseFloat(newAsset.depreciationRate)
      });
      setFormMessage('Asset added successfully!');
      setNewAsset({ name: '', purchaseValue: '', purchaseDate: new Date().toISOString().split('T')[0], depreciationRate: '' });
      setShowAddAssetForm(false);
    } catch (err) {
      setFormMessage(`Failed to add asset: ${err.message}`);
    }
    setTimeout(() => setFormMessage(''), 5000);
  };

  const handleLiabilityInputChange = (e) => {
    const { name, value } = e.target;
    setNewLiability(prev => ({ ...prev, [name]: value }));
  };

  const handleLiabilitySubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      await addLiability({
        ...newLiability,
        amount: parseFloat(newLiability.amount),
        interestRate: newLiability.type === 'Loan' ? parseFloat(newLiability.interestRate) : undefined,
      });
      setFormMessage('Liability added successfully!');
      setNewLiability({ name: '', type: 'Loan', amount: '', interestRate: '', repaymentDate: '', dueDate: '' });
      setShowAddLiabilityForm(false);
    } catch (err) {
      setFormMessage(`Failed to add liability: ${err.message}`);
    }
    setTimeout(() => setFormMessage(''), 5000);
  };

  const handleMarkCustomerPaid = async (id) => {
    if (window.confirm('Are you sure you want to mark this customer debt as paid?')) {
      try {
        await markCustomerDebtPaid(id);
        setFormMessage('Customer debt marked as paid!');
      } catch (err) {
        setFormMessage(`Failed to mark debt paid: ${err.message}`);
      }
      setTimeout(() => setFormMessage(''), 5000);
    }
  };

  const handleMarkSupplierPaid = async (id) => {
    if (window.confirm('Are you sure you want to mark this supplier debt as paid?')) {
      try {
        await markSupplierDebtPaid(id);
        setFormMessage('Supplier debt marked as paid!');
      } catch (err) {
        setFormMessage(`Failed to mark debt paid: ${err.message}`);
      }
      setTimeout(() => setFormMessage(''), 5000);
    }
  };

  const canManage = currentUser && ['admin', 'manager', 'accountant'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Accountant can access Assets, Liabilities & Debt.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading financial data...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading financial data: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Assets, Liabilities & Debt</h2>

      <div className="mb-6 flex flex-wrap space-x-4 space-y-2 md:space-y-0">
        <Button onClick={() => { setShowAddAssetForm(true); setFormMessage(''); }}>Add New Asset</Button>
        <Button onClick={() => { setShowAddLiabilityForm(true); setFormMessage(''); }} className="bg-blue-600 hover:bg-blue-700">Add New Liability</Button>
      </div>

      {formMessage && (
        <div className={`p-3 rounded-md mb-4 ${formMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {formMessage}
        </div>
      )}

      {showAddAssetForm && (
        <Card title="Add New Asset" className="mb-8">
          <form onSubmit={handleAssetSubmit}>
            <Input label="Asset Name" name="name" value={newAsset.name} onChange={handleAssetInputChange} required />
            <Input label="Purchase Value (Ksh)" name="purchaseValue" type="number" value={newAsset.purchaseValue} onChange={handleAssetInputChange} min="0" required />
            <Input label="Purchase Date" name="purchaseDate" type="date" value={newAsset.purchaseDate} onChange={handleAssetInputChange} required />
            <Input label="Annual Depreciation Rate (e.g., 0.1 for 10%)" name="depreciationRate" type="number" step="0.01" value={newAsset.depreciationRate} onChange={handleAssetInputChange} min="0" max="1" required />
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>Add Asset</Button>
              <Button type="button" onClick={() => setShowAddAssetForm(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {showAddLiabilityForm && (
        <Card title="Add New Liability" className="mb-8">
          <form onSubmit={handleLiabilitySubmit}>
            <Input label="Liability Name" name="name" value={newLiability.name} onChange={handleLiabilityInputChange} required />
            <Select
              label="Type" name="type" value={newLiability.type} onChange={handleLiabilityInputChange}
              options={[{ value: 'Loan', label: 'Loan' }, { value: 'Supplier Debt', label: 'Supplier Debt' }, { value: 'Taxes', label: 'Taxes' }, { value: 'Other', label: 'Other' }]}
            />
            <Input label="Amount (Ksh)" name="amount" type="number" value={newLiability.amount} onChange={handleLiabilityInputChange} min="0" required />
            {newLiability.type === 'Loan' && (
              <>
                <Input label="Interest Rate (e.g., 0.05 for 5%)" name="interestRate" type="number" step="0.01" value={newLiability.interestRate} onChange={handleLiabilityInputChange} min="0" required />
                <Input label="Repayment Date" name="repaymentDate" type="date" value={newLiability.repaymentDate} onChange={handleLiabilityInputChange} required />
              </>
            )}
            {newLiability.type !== 'Loan' && (
              <Input label="Due Date" name="dueDate" type="date" value={newLiability.dueDate} onChange={handleLiabilityInputChange} />
            )}
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>Add Liability</Button>
              <Button type="button" onClick={() => setShowAddLiabilityForm(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Fixed Assets Register" className="mb-8">
        <Table
          headers={['Asset Name', 'Purchase Value (Ksh)', 'Purchase Date', 'Depreciation Rate', 'Current Value (Ksh)']}
          data={assets}
          renderRow={(asset) => (
            <tr key={asset.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {asset.purchaseValue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.purchaseDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(asset.depreciationRate * 100).toFixed(1)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {calculateCurrentValue(asset).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            </tr>
          )}
        />
      </Card>

      <Card title="Liabilities" className="mb-8">
        <Table
          headers={['Liability Name', 'Type', 'Amount (Ksh)', 'Interest Rate', 'Due/Repayment Date']}
          data={liabilities}
          renderRow={(liability) => (
            <tr key={liability.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{liability.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{liability.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {liability.amount.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{liability.interestRate ? `${(liability.interestRate * 100).toFixed(1)}%` : 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{liability.repaymentDate || liability.dueDate || 'N/A'}</td>
            </tr>
          )}
        />
      </Card>

      <Card title="Debt Management">
        {formMessage && (
          <div className={`p-3 rounded-md mb-4 ${formMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {formMessage}
          </div>
        )}
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Debts (Accounts Receivable)</h3>
        <Table
          headers={['Customer Name', 'Product', 'Amount Due (Ksh)', 'Due Date', 'Status', 'Actions']}
          data={customerDebts}
          renderRow={(debt) => (
            <tr key={debt.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{debt.customerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.productName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {debt.amountDue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.dueDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {debt.isOverdue ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => handleMarkCustomerPaid(debt.id)} className="bg-green-600 hover:bg-green-700" disabled={loading}>Mark Paid</Button>
              </td>
            </tr>
          )}
        />

        <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800">Business Debts (Accounts Payable)</h3>
        <Table
          headers={['Supplier Name', 'Product', 'Amount Due (Ksh)', 'Due Date', 'Status', 'Actions']}
          data={supplierDebts}
          renderRow={(debt) => (
            <tr key={debt.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{debt.supplierName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.productName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {debt.amountDue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.dueDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {debt.isOverdue ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => handleMarkSupplierPaid(debt.id)} className="bg-green-600 hover:bg-green-700" disabled={loading}>Mark Paid</Button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

const AdminProfitLossReports = () => {
  const { sales, purchases, expenses, currentUser, loading, error } = useContext(AppContext);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredSales = sales.filter(s => new Date(s.date) >= new Date(startDate) && new Date(s.date) <= new Date(endDate));
  const filteredPurchases = purchases.filter(p => new Date(p.date) >= new Date(startDate) && new Date(p.date) <= new Date(endDate));
  const filteredExpenses = expenses.filter(e => new Date(e.date) >= new Date(startDate) && new Date(e.date) <= new Date(endDate));

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.quantity * s.unitPrice), 0);
  const costOfGoodsSold = filteredPurchases.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
  const grossProfit = totalRevenue - costOfGoodsSold;
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  const canView = currentUser && ['admin', 'manager', 'accountant'].includes(currentUser.role);

  if (!canView) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Accountant can access P&L Reports.</p>;
  }

  if (loading) return <p className="text-center p-8">Generating reports...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading data for reports: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Profit and Loss Statement</h2>

      <Card title="Select Date Range" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </Card>

      <Card title={`Profit & Loss Report (${startDate} to ${endDate})`}>
        <div className="space-y-4 text-gray-800">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total Revenue (Sales):</span>
            <span className="font-bold text-green-700">Ksh {totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Cost of Goods Sold (Purchases):</span>
            <span className="font-bold text-red-700">Ksh {costOfGoodsSold.toLocaleString()}</span>
          </div>
          <div className="border-t-2 border-gray-300 pt-4 flex justify-between items-center text-xl font-bold">
            <span>Gross Profit:</span>
            <span className={grossProfit >= 0 ? "text-green-800" : "text-red-800"}>Ksh {grossProfit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg mt-6">
            <span className="font-semibold">Total Operating Expenses:</span>
            <span className="font-bold text-red-700">Ksh {totalOperatingExpenses.toLocaleString()}</span>
          </div>
          <div className="border-t-2 border-gray-300 pt-4 flex justify-between items-center text-2xl font-bold">
            <span>Net Profit:</span>
            <span className={netProfit >= 0 ? "text-green-800" : "text-red-800"}>Ksh {netProfit.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminUserRoleManagement = () => {
  const { users, updateUserProfile, deleteUser, currentUser, loading, error } = useContext(AppContext);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [message, setMessage] = useState('');

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'customer-support', label: 'Customer Support' },
    { value: 'client', label: 'Client' },
  ];

  const handleEditRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setMessage('');
  };

  const handleSaveRole = async () => {
    if (editingUser) {
      try {
        await updateUserProfile(editingUser.id, { role: newRole });
        setMessage(`Role for ${editingUser.username} updated to ${newRole}.`);
        setEditingUser(null);
        setNewRole('');
      } catch (err) {
        setMessage(`Failed to update role: ${err.message}`);
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        setMessage('User deleted successfully!');
      } catch (err) {
        setMessage(`Failed to delete user: ${err.message}`);
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const canManage = currentUser && currentUser.role === 'admin';

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin can manage User Roles.</p>;
  }

  if (loading) return <p className="text-center p-8">Loading users...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error loading users: {error}</p>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">User & Role Management</h2>

      {message && <div className={`p-3 rounded-md mb-4 ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>}

      {editingUser && (
        <Card title={`Edit Role for ${editingUser.username}`} className="mb-8">
          <Select
            label="New Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={roles}
          />
          <div className="flex space-x-4">
            <Button onClick={handleSaveRole} disabled={loading}>Save Role</Button>
            <Button type="button" onClick={() => setEditingUser(null)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
          </div>
        </Card>
      )}

      <Card title="All Users">
        <Table
          headers={['Username', 'Full Name', 'Role', 'Actions']}
          data={users}
          renderRow={(user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => handleEditRole(user)} className="bg-indigo-600 hover:bg-indigo-700 mr-2" disabled={loading}>Edit Role</Button>
                {/* Only allow deletion for non-admin users and not the current logged-in user */}
                {user.role !== 'admin' && currentUser && user.id !== currentUser.id && (
                  <Button onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={loading}>Delete User</Button>
                )}
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};


// --- Main App Component ---
const App = () => {
  const { currentUser, logout, currentPage, setCurrentPage, loading, error } = useContext(AppContext);

  const renderPage = () => {
    // Show a global loading or error message if data is being fetched or failed
    if (loading && currentPage !== 'login' && currentPage !== 'signup') {
      return <p className="text-center p-8 text-blue-500">Loading application data...</p>;
    }
    if (error && currentPage !== 'login' && currentPage !== 'signup') {
      return <p className="text-center p-8 text-red-500">Error loading application: {error}</p>;
    }

    switch (currentPage) {
      case 'home':
        return <Homepage />;
      case 'about':
        return <AboutUsPage />;
      case 'products':
        return <ProductsPage />;
      case 'contact':
        return <ContactUsPage />;
      case 'login':
        return <AuthForm type="login" />;
      case 'signup':
        return <AuthForm type="signup" />;
      case 'client-dashboard':
        return <ClientDashboard />;
      case 'client-dashboard-order-history':
        return <ClientOrderHistory />;
      case 'client-dashboard-place-order':
        return <PlaceNewOrder />;
      case 'client-dashboard-profile':
        return <ClientProfileManagement />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-inventory':
        return <AdminInventoryManagement />;
      case 'admin-sales-purchases':
        return <AdminSalesPurchases />;
      case 'admin-orders':
        return <AdminOrderManagement />;
      case 'admin-expenses':
        return <AdminExpensesTracking />;
      case 'admin-assets-liabilities-debt':
        return <AdminAssetsLiabilitiesDebt />;
      case 'admin-pnl':
        return <AdminProfitLossReports />;
      case 'admin-users':
        return <AdminUserRoleManagement />;
      default:
        return <Homepage />;
    }
  };

  const publicNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const clientNavItems = [
    { id: 'client-dashboard', label: 'Dashboard' },
    { id: 'client-dashboard-place-order', label: 'Place New Order' },
    { id: 'client-dashboard-order-history', label: 'Order History' },
    { id: 'client-dashboard-profile', label: 'Profile' },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', roles: ['admin', 'manager', 'cashier', 'accountant', 'customer-support'] },
    { id: 'admin-inventory', label: 'Stock Management', roles: ['admin', 'manager'] },
    { id: 'admin-sales-purchases', label: 'Sales & Purchases', roles: ['admin', 'manager', 'cashier'] },
    { id: 'admin-orders', label: 'Order Management', roles: ['admin', 'manager', 'customer-support'] },
    { id: 'admin-expenses', label: 'Expenses Tracking', roles: ['admin', 'manager', 'accountant'] },
    { id: 'admin-assets-liabilities-debt', label: 'Assets, Liabilities & Debt', roles: ['admin', 'manager', 'accountant'] },
    { id: 'admin-pnl', label: 'Profit & Loss Reports', roles: ['admin', 'manager', 'accountant'] },
    { id: 'admin-users', label: 'User & Role Management', roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased flex flex-col">
      {/* The Tailwind CSS CDN, Font Awesome, and Inter font links are now in public/index.html */}
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Custom scrollbar for better aesthetics */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>

      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-900 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center sticky top-0 z-20">
        <div className="flex items-center mb-2 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mr-4">BestLine</h1>
          <p className="hidden md:block text-sm italic">“Reliable Chemicals, Sustainable Harvests.”</p>
        </div>
        <nav className="flex-grow flex justify-center md:justify-end">
          <ul className="flex flex-wrap justify-center space-x-4 text-lg">
            {publicNavItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-1 rounded-md transition-colors duration-200 ${currentPage === item.id ? 'bg-green-600 font-semibold' : 'hover:bg-green-800'}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
            {!currentUser ? (
              <>
                <li>
                  <button
                    onClick={() => setCurrentPage('login')}
                    className={`px-3 py-1 rounded-md transition-colors duration-200 ${currentPage === 'login' ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('signup')}
                    className={`px-3 py-1 rounded-md transition-colors duration-200 ${currentPage === 'signup' ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}
                  >
                    Sign Up
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => setCurrentPage(currentUser.role === 'client' ? 'client-dashboard' : 'admin-dashboard')}
                    className={`px-3 py-1 rounded-md transition-colors duration-200 ${['client-dashboard', 'admin-dashboard'].includes(currentPage) ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}
                  >
                    {currentUser.role === 'client' ? 'My Account' : 'Admin Panel'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    Logout ({currentUser.username})
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Conditional Sidebar Navigation */}
        {currentUser && (currentUser.role === 'client' || ['admin', 'manager', 'cashier', 'accountant', 'customer-support'].includes(currentUser.role)) && (
          <nav className="bg-gray-800 text-white w-full md:w-64 p-4 shadow-lg md:h-screen md:sticky md:top-0 overflow-y-auto z-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">
              {currentUser.role === 'client' ? 'Client Menu' : 'Admin Menu'}
            </h3>
            <ul className="space-y-2">
              {currentUser.role === 'client' ? (
                clientNavItems.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                        ${currentPage === item.id ? 'bg-green-600 font-semibold' : 'hover:bg-gray-700'}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))
              ) : (
                adminNavItems.map(item => (
                  item.roles.includes(currentUser.role) && (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentPage(item.id)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200
                          ${currentPage === item.id ? 'bg-green-600 font-semibold' : 'hover:bg-gray-700'}`}
                      >
                        {item.label}
                      </button>
                    </li>
                  )
                ))
              )}
            </ul>
          </nav>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

// Root component for the application
export default function BestLineApp() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
