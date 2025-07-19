import React, { useState, useEffect, createContext, useContext } from 'react';

// Context for managing global state like user authentication, products, and orders
const AppContext = createContext();

const AppProvider = ({ children }) => {
  // --- Simulated Data Storage (In-memory for demonstration) ---
  const [currentUser, setCurrentUser] = useState(null); // { id, username, role, name, farmType, location, contactInfo }
  // Renamed the setter to setUsersState to avoid linting warnings when not directly used in AppProvider's render
  const [users, setUsersState] = useState([
    { id: 'admin-1', username: 'admin', password: 'password', role: 'admin', name: 'Admin User', farmType: '', location: '', contactInfo: '' },
    { id: 'manager-1', username: 'manager', password: 'password', role: 'manager', name: 'Manager User', farmType: '', location: '', contactInfo: '' },
    { id: 'cashier-1', username: 'cashier', password: 'password', role: 'cashier', name: 'Cashier User', farmType: '', location: '', contactInfo: '' },
    { id: 'client-1', username: 'client', password: 'password', role: 'client', name: 'John Doe', farmType: 'Mixed Farming', location: 'Nakuru', contactInfo: 'john.doe@example.com' },
  ]);

  const [products, setProducts] = useState([
    // NEW PRODUCTS
    {
      id: 'prod-1',
      name: 'DengaGard001 - Organic Concentration',
      description: '70% Formulated Garlic Consecration Organic. Mode of Action: DengaGard001 (DG) is a non-chemical insecticide resistance inoculant. DG is a natural fire prophylactic chemical release in your crop. DG offers a broad flexibility interval which is directly from sprouting to during harvest. It is a foliar fertilizer compatible with pyrethroids and conventional PPI herbicides. Application: 60ml/litre of water for foliar spray. 60ml/litre of water for foliar drenching. Storage: Keep in room temperature out of direct sunlight.',
      category: 'Pesticide', // Categorized as Pesticide (Insecticide)
      price: 4800, // Example price
      stock: 120,
      reorderLevel: 40,
      batch: 'DG001',
      expiryDate: '2027-01-31',
      supplierInfo: 'BioAgro Solutions'
    },
    {
      id: 'prod-2',
      name: 'AGROCURE - Organic Solution',
      description: 'Organic Booster: Beneficial antioxidant, plant extract, micro-organisms, organic acids and other useful bio-active substances. Mode of Action: AGROCURE is a organic plant polymer capable of de-ionizing hazardous substances (e.g., heavy metals and decomposing residues). AGROCURE is a plant extract which provides complete organisms promoter bio-de-grad. From macro molecules in the soil to macro molecules of soil organisms, AGROCURE increases disposal rates and livestock\'s wastes. Its therefore ideal for composting and leverage treatments to abiotic factors. Application (Pot Lixiviates): 100ml/50 litres of water in a pit hole every week until the plant solidifies. Then apply twice a week. Storage: Keep in room temperature out of direct sunlight.',
      category: 'Foliar Feeds', // Categorized as Foliar Feeds (Booster)
      price: 5000, // Example price
      stock: 90,
      reorderLevel: 30,
      batch: 'AGR001',
      expiryDate: '2026-11-20',
      supplierInfo: 'EcoHarvest Ltd.'
    },
    {
      id: 'prod-3',
      name: 'PEACE GROW - Organic Solution',
      description: 'Nitrogen (N): 0.00% Phosphorus (P): 90.00% Potassium (K): 90.00%. Mode of Action: PEACE GROW is a large chain plant polymer compatible with optimum ecologically safe. PEACE GROW is a plant extract that has rich organic nutrients that provide plants which provide complete organisms and bio-available. The plant is overcomes stress, by the deficiency in other biotic and abiotic factors. Application (Spraying): 1ml per litre of water. Drenching: 2ml per litre of water. Storage: Keep in room temperature out of direct sunlight. Precaution: Shake well before use.',
      category: 'Foliar Feeds', // Categorized as Foliar Feeds (N-P-K)
      price: 2800, // Example price
      stock: 110,
      reorderLevel: 35,
      batch: 'PG001',
      expiryDate: '2027-03-10',
      supplierInfo: 'NutriPlant Kenya'
    },
  ]);

  const [orders, setOrders] = useState([
    { id: 'ord-1', clientId: 'client-1', items: [{ productId: 'prod-1', quantity: 2, unitPrice: 2800 }], totalAmount: 5600, orderDate: '2025-07-10', status: 'Delivered', invoiceDetails: 'INV-001' },
    { id: 'ord-2', clientId: 'client-1', items: [{ productId: 'prod-2', quantity: 1, unitPrice: 3500 }], totalAmount: 3500, orderDate: '2025-07-12', status: 'Pending', invoiceDetails: 'INV-002' },
  ]);

  const [sales, setSales] = useState([
    { id: 'sale-1', type: 'online', customerName: 'John Doe', clientId: 'client-1', productId: 'prod-1', quantity: 2, unitPrice: 2800, paymentMethod: 'M-Pesa', date: '2025-07-10', isCredit: false, orderId: 'ord-1' },
    { id: 'sale-2', type: 'walk-in', customerName: 'Local Farmer Co-op', productId: 'prod-3', quantity: 5, unitPrice: 4200, paymentMethod: 'Cash', date: '2025-07-11', isCredit: false },
    { id: 'sale-3', type: 'online', customerName: 'John Doe', clientId: 'client-1', productId: 'prod-2', quantity: 1, unitPrice: 3500, paymentMethod: 'Credit', date: '2025-07-12', isCredit: true, amountDue: 3500, dueDate: '2025-08-12', paid: false, orderId: 'ord-2' },
  ]);

  const [purchases, setPurchases] = useState([
    { id: 'pur-1', supplierName: 'BioAgro Solutions', productId: 'prod-1', quantity: 50, cost: 2200, date: '2025-06-01', isCredit: false },
    { id: 'pur-2', supplierName: 'EcoHarvest Ltd.', productId: 'prod-2', quantity: 25, cost: 2800, date: '2025-06-15', isCredit: true, amountDue: 70000, dueDate: '2025-07-15', paid: false },
  ]);

  const [expenses, setExpenses] = useState([
    { id: 'exp-1', description: 'Office Rent', category: 'Rent', amount: 50000, date: '2025-07-01' },
    { id: 'exp-2', description: 'Fuel for Delivery Van', category: 'Transport', amount: 8000, date: '2025-07-05' },
    { id: 'exp-3', description: 'Staff Wages', category: 'Salaries', amount: 120000, date: '2025-07-15' },
  ]);

  const [assets, setAssets] = useState([
    { id: 'asset-1', name: 'Delivery Van', purchaseValue: 1500000, purchaseDate: '2023-01-01', depreciationRate: 0.15 },
    { id: 'asset-2', name: 'Warehouse Building', purchaseValue: 5000000, purchaseDate: '2020-05-10', depreciationRate: 0.05 },
  ]);

  const [liabilities, setLiabilities] = useState([
    { id: 'lib-1', name: 'Bank Loan', type: 'Loan', amount: 1000000, interestRate: 0.12, repaymentDate: '2026-12-31' },
    { id: 'lib-2', name: 'Pending Tax Payment', type: 'Taxes', amount: 50000, dueDate: '2025-07-31' },
  ]);

  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'about', 'products', 'contact', 'login', 'signup', 'client-dashboard', 'admin-dashboard', 'admin-inventory', etc.

  // --- Utility Functions ---
  const getProductById = (id) => products.find(p => p.id === id);
  // Corrected typo in getUserById: ensure it compares u.id with the passed 'id'
  const getUserById = (id) => users.find(u => u.id === id);

  const generateUniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const calculateCurrentValue = (asset) => {
    const purchaseYear = new Date(asset.purchaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsDepreciated = currentYear - purchaseYear;
    return asset.purchaseValue * Math.pow((1 - asset.depreciationRate), yearsDepreciated);
  };

  const getCustomerDebts = () => {
    return sales.filter(sale => sale.isCredit && !sale.paid).map(sale => ({
      ...sale,
      productName: getProductById(sale.productId)?.name || 'Unknown Product',
      isOverdue: sale.dueDate && new Date(sale.dueDate) < new Date()
    }));
  };

  const getSupplierDebts = () => {
    return purchases.filter(purchase => purchase.isCredit && !purchase.paid).map(purchase => ({
      ...purchase,
      productName: getProductById(purchase.productId)?.name || 'Unknown Product',
      isOverdue: purchase.dueDate && new Date(purchase.dueDate) < new Date()
    }));
  };

  // --- Authentication Functions ---
  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'client') {
        setCurrentPage('client-dashboard');
      } else {
        setCurrentPage('admin-dashboard');
      }
      return true;
    }
    return false;
  };

  const signup = (newUser) => {
    if (users.some(u => u.username === newUser.username)) {
      return false; // Username already exists
    }
    const userWithId = { ...newUser, id: generateUniqueId('user'), role: 'client' };
    setUsersState(prev => [...prev, userWithId]); // Use setUsersState here
    setCurrentUser(userWithId);
    setCurrentPage('client-dashboard');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // --- Data Management Functions ---
  const addProduct = (newProduct) => {
    setProducts(prev => [...prev, { ...newProduct, id: generateUniqueId('prod') }]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const placeOrder = (clientId, items) => {
    const newOrderId = generateUniqueId('ord');
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newOrder = {
      id: newOrderId,
      clientId,
      items,
      totalAmount,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      invoiceDetails: `INV-${Date.now()}`
    };
    setOrders(prev => [...prev, newOrder]);

    // Simulate recording sale for online order
    items.forEach(item => {
      const product = getProductById(item.productId);
      if (product) {
        setSales(prev => [...prev, {
          id: generateUniqueId('sale'),
          type: 'online',
          customerName: getUserById(clientId)?.name || 'Online Client',
          clientId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          paymentMethod: 'Online Payment (Simulated)',
          date: new Date().toISOString().split('T')[0],
          isCredit: false, // Assume online orders are paid
          orderId: newOrderId,
        }]);
        // Update stock
        setProducts(prev => prev.map(p =>
          p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
        ));
      }
    });
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
  };

  const recordSale = (newSale) => {
    setSales(prev => [...prev, { ...newSale, id: generateUniqueId('sale') }]);
    // Update stock for walk-in sales
    if (newSale.type === 'walk-in') {
      setProducts(prev => prev.map(p =>
        p.id === newSale.productId ? { ...p, stock: p.stock - newSale.quantity } : p
      ));
    }
  };

  const recordPurchase = (newPurchase) => {
    setPurchases(prev => [...prev, { ...newPurchase, id: generateUniqueId('pur') }]);
    // Update stock
    setProducts(prev => prev.map(p =>
      p.id === newPurchase.productId ? { ...p, stock: p.stock + newPurchase.quantity } : p
    ));
  };

  const addExpense = (newExpense) => {
    setExpenses(prev => [...prev, { ...newExpense, id: generateUniqueId('exp') }]);
  };

  const addAsset = (newAsset) => {
    setAssets(prev => [...prev, { ...newAsset, id: generateUniqueId('asset') }]);
  };

  const addLiability = (newLiability) => {
    setLiabilities(prev => [...prev, { ...newLiability, id: generateUniqueId('lib') }]);
  };

  const markCustomerDebtPaid = (saleId) => {
    setSales(prev => prev.map(sale => sale.id === saleId ? { ...sale, paid: true, amountDue: 0 } : sale));
  };

  const markSupplierDebtPaid = (purchaseId) => {
    setPurchases(prev => prev.map(purchase => purchase.id === purchaseId ? { ...purchase, paid: true, amountDue: 0 } : purchase));
  };

  const updateUserProfile = (userId, updatedInfo) => {
    setUsersState(prev => prev.map(u => u.id === userId ? { ...u, ...updatedInfo } : u)); // Use setUsersState here
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedInfo }));
    }
  };

  // NEW: Function to delete a user
  const deleteUser = (userIdToDelete) => {
    setUsersState(prev => prev.filter(u => u.id !== userIdToDelete));
    // If the deleted user was the current user, log them out
    if (currentUser && currentUser.id === userIdToDelete) {
      setCurrentUser(null);
      setCurrentPage('home');
    }
  };

  const state = {
    currentUser, setCurrentUser, login, signup, logout,
    products, setProducts, addProduct, updateProduct, deleteProduct, getProductById,
    users, getUserById, updateUserProfile, deleteUser, // Added deleteUser to context
    orders, setOrders, placeOrder, updateOrderStatus,
    sales, setSales, recordSale,
    purchases, setPurchases, recordPurchase,
    expenses, setExpenses, addExpense,
    assets, setAssets, addAsset, calculateCurrentValue,
    liabilities, setLiabilities, addLiability,
    getCustomerDebts, markCustomerDebtPaid,
    getSupplierDebts, markSupplierDebtPaid,
    currentPage, setCurrentPage,
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
  const { setCurrentPage, products } = useContext(AppContext);
  const featuredProducts = products.slice(0, 3); // Show first 3 as featured

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
            src="/images/cabbages.JPG" // Corrected path and extension
            alt="Vibrant Cabbages"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Healthy Cabbage Field</p>
        </div>
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/pineapples.JPG" // Corrected path and extension
            alt="Fresh Pineapples"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Fresh Pineapple Harvest</p>
        </div>
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/rose flowers.JPG" // Corrected path and extension (including space)
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
  const { products, setCurrentPage, currentUser } = useContext(AppContext);
  const [filterCategory, setFilterCategory] = useState('All');
  const productCategories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = filterCategory === 'All'
    ? products
    : products.filter(p => p.category === filterCategory);

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
              <p className="text-gray-500 text-sm">Availability: {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock`}</p>
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
  const { login, signup, setCurrentPage } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmType, setFarmType] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (type === 'login') {
      if (login(username, password)) {
        // Success handled by context, page changed
      } else {
        setError('Invalid username or password.');
      }
    } else { // signup
      const success = signup({ username, password, name, farmType, location, contactInfo });
      if (!success) {
        setError('Username already exists. Please choose a different one.');
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

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button type="submit" className="w-full mb-4">
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
  const { currentUser, setCurrentPage } = useContext(AppContext);

  if (!currentUser || currentUser.role !== 'client') {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as a client.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* ... rest of the ClientDashboard component */}
    </div>
  );
};
