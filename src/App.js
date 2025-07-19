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
      price: 2800, // Example price
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
      price: 3500, // Example price
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
      price: 4200, // Example price
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

  const state = {
    currentUser, setCurrentUser, login, signup, logout,
    products, setProducts, addProduct, updateProduct, deleteProduct, getProductById,
    users, getUserById, updateUserProfile, // Removed setUsers from here to avoid linting warning
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
            <div className="flex space-x-4 text-2xl">
              {/* Changed <a> to <div> with onClick for social media links */}
              <div onClick={() => window.open('https://facebook.com/bestlineagro', '_blank')} className="text-blue-600 hover:text-blue-800 cursor-pointer"><i className="fab fa-facebook"></i></div>
              <div onClick={() => window.open('https://twitter.com/bestlineagro', '_blank')} className="text-blue-400 hover:text-blue-600 cursor-pointer"><i className="fab fa-twitter"></i></div>
              <div onClick={() => window.open('https://instagram.com/bestlineagro', '_blank')} className="text-red-600 hover:text-red-800 cursor-pointer"><i className="fab fa-instagram"></i></div>
              <div onClick={() => window.open('https://linkedin.com/company/bestlineagro', '_blank')} className="text-blue-700 hover:text-blue-900 cursor-pointer"><i className="fab fa-linkedin"></i></div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Our Location</h4>
            {/* Placeholder for Google Map */}
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
          {/* Changed className for better visibility */}
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
  const { currentUser, orders, getProductById } = useContext(AppContext);
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'client') return null;

  const clientOrders = orders.filter(order => order.clientId === currentUser.id);

  const handleDownloadInvoice = (order) => {
    setMessage(`Invoice for Order ID: ${order.id}\nStatus: ${order.status}\nTotal: Ksh ${order.totalAmount.toLocaleString()}\n\nItems:\n${order.items.map(item => `${getProductById(item.productId)?.name || 'N/A'} x ${item.quantity} @ Ksh ${item.unitPrice}`).join('\n')}`);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

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
  const { currentUser, products, placeOrder } = useContext(AppContext);
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

  const handleSubmitOrder = (e) => {
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

    const newOrder = placeOrder(currentUser.id, itemsToOrder);
    setMessage(`Order ${newOrder.id} placed successfully! Total: Ksh ${newOrder.totalAmount.toLocaleString()}. Status: ${newOrder.status}`);
    setSelectedProducts({}); // Clear cart
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

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
            <Button type="submit" disabled={Object.keys(selectedProducts).length === 0}>
              Submit Order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const ClientProfileManagement = () => {
  const { currentUser, updateUserProfile } = useContext(AppContext);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, profileData);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Manage Your Profile</h2>
      <Card>
        {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={profileData.name} onChange={handleChange} required />
          <Input label="Farm Type (e.g., Mixed, Crop, Livestock)" name="farmType" value={profileData.farmType} onChange={handleChange} />
          <Input label="Location (Town/District)" name="location" value={profileData.location} onChange={handleChange} required />
          <Input label="Contact Info (Email/Phone)" name="contactInfo" value={profileData.contactInfo} onChange={handleChange} required />
          <Button type="submit">Update Profile</Button>
        </form>
      </Card>
    </div>
  );
};


// --- Admin Panel Components ---

const AdminDashboard = () => {
  const { products, sales, expenses, orders, getCustomerDebts, getSupplierDebts, currentUser } = useContext(AppContext);

  if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as Admin or Manager.</p>;
  }

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
  const { products, addProduct, updateProduct, deleteProduct, currentUser } = useContext(AppContext);
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', category: 'Foliar Feeds', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), reorderLevel: parseInt(newProduct.reorderLevel) });
      setEditingProduct(null);
    } else {
      addProduct({ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), reorderLevel: parseInt(newProduct.reorderLevel) });
    }
    setNewProduct({ name: '', description: '', category: 'Foliar Feeds', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: '' });
    setShowAddEditForm(false);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name, description: product.description, category: product.category,
      price: product.price.toString(), stock: product.stock.toString(), reorderLevel: product.reorderLevel.toString(),
      batch: product.batch, expiryDate: product.expiryDate, supplierInfo: product.supplierInfo
    });
    setShowAddEditForm(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const canManage = currentUser && ['admin', 'manager'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin or Manager can access Inventory.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Inventory Management</h2>

      <div className="mb-6">
        <Button onClick={() => { setShowAddEditForm(true); setEditingProduct(null); setNewProduct({ name: '', description: '', category: 'Foliar Feeds', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: '' }); }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </Button>
      </div>

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
              <Button type="submit">{editingProduct ? 'Update Product' : 'Add Product'}</Button>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.reorderLevel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.batch}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.expiryDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {product.stock <= product.reorderLevel && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>}
                {new Date(product.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3)) && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Expiring Soon</span>}
                {product.stock > product.reorderLevel && new Date(product.expiryDate) >= new Date(new Date().setMonth(new Date().getMonth() + 3)) && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Good</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => handleEditClick(product)} className="bg-indigo-600 hover:bg-indigo-700 mr-2">Edit</Button>
                <Button onClick={() => handleDeleteClick(product.id)} className="bg-red-600 hover:bg-red-700">Delete</Button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

const AdminSalesPurchases = () => {
  const { products, sales, purchases, recordSale, recordPurchase, getProductById, currentUser } = useContext(AppContext);
  const [showAddSaleForm, setShowAddSaleForm] = useState(false);
  const [showAddPurchaseForm, setShowAddPurchaseForm] = useState(false);
  const [saleMessage, setSaleMessage] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

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

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    setSaleMessage(''); // Clear previous messages
    const product = getProductById(newSale.productId);
    if (!product) { setSaleMessage('Error: Product not found.'); return; }
    if (parseInt(newSale.quantity) > product.stock) { setSaleMessage('Error: Quantity exceeds stock!'); return; }

    const saleData = {
      ...newSale,
      quantity: parseInt(newSale.quantity),
      unitPrice: product.price,
      amountDue: newSale.isCredit ? (parseInt(newSale.quantity) * product.price) : 0,
      paid: !newSale.isCredit,
    };
    recordSale(saleData);
    setSaleMessage('Sale recorded successfully!');
    setNewSale({ type: 'walk-in', customerName: '', productId: '', quantity: '', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0], isCredit: false, amountDue: '', dueDate: '' });
    setShowAddSaleForm(false);
    setTimeout(() => setSaleMessage(''), 5000); // Clear message after 5 seconds
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    setPurchaseMessage(''); // Clear previous messages
    const purchaseData = {
      ...newPurchase,
      quantity: parseInt(newPurchase.quantity),
      cost: parseFloat(newPurchase.cost),
      amountDue: newPurchase.isCredit ? (parseInt(newPurchase.quantity) * parseFloat(newPurchase.cost)) : 0,
      paid: !newPurchase.isCredit,
    };
    recordPurchase(purchaseData);
    setPurchaseMessage('Purchase recorded successfully!');
    setNewPurchase({ supplierName: '', productId: '', quantity: '', cost: '', date: new Date().toISOString().split('T')[0], isCredit: false, amountDue: '', dueDate: '' });
    setShowAddPurchaseForm(false);
    setTimeout(() => setPurchaseMessage(''), 5000); // Clear message after 5 seconds
  };

  const canRecord = currentUser && ['admin', 'manager', 'cashier'].includes(currentUser.role);
  const canManagePurchases = currentUser && ['admin', 'manager'].includes(currentUser.role);

  if (!canRecord) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Cashier can access Sales/Purchases.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Sales & Purchase Transactions</h2>

      <div className="mb-6 flex space-x-4">
        <Button onClick={() => setShowAddSaleForm(true)}>Record New Sale</Button>
        {canManagePurchases && <Button onClick={() => setShowAddPurchaseForm(true)} className="bg-blue-600 hover:bg-blue-700">Record New Purchase</Button>}
      </div>

      {saleMessage && (
        <div className={`p-3 rounded-md mb-4 ${saleMessage.includes('Error') ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
          {saleMessage}
        </div>
      )}
      {purchaseMessage && (
        <div className={`p-3 rounded-md mb-4 ${purchaseMessage.includes('Error') ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
          {purchaseMessage}
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
              <Button type="submit">Record Sale</Button>
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
              <Button type="submit">Record Purchase</Button>
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
  const { orders, updateOrderStatus, getProductById, getUserById, currentUser } = useContext(AppContext);
  const [message, setMessage] = useState('');

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setMessage(`Order ${orderId} status updated to ${newStatus}.`);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
    // In a real app, send email/SMS notification here
  };

  const canManage = currentUser && ['admin', 'manager', 'customer-support'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin or Manager can access Order Management.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Client Order Management</h2>

      <Card title="All Client Orders">
        {message && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
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
  const { expenses, addExpense, currentUser } = useContext(AppContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '', category: 'Transport', amount: '', date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense({ ...newExpense, amount: parseFloat(newExpense.amount) });
    setMessage('Expense added successfully!');
    setNewExpense({ description: '', category: 'Transport', amount: '', date: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  const canManage = currentUser && ['admin', 'manager', 'accountant'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Accountant can access Expenses.</p>;
  }

  // Group expenses by category for summary
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Expenses Tracking</h2>

      <div className="mb-6">
        <Button onClick={() => setShowAddForm(true)}>Add New Expense</Button>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
          {message}
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
              <Button type="submit">Add Expense</Button>
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
  const { assets, addAsset, calculateCurrentValue, liabilities, addLiability, getCustomerDebts, getSupplierDebts, markCustomerDebtPaid, markSupplierDebtPaid, currentUser } = useContext(AppContext);
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '', purchaseValue: '', purchaseDate: new Date().toISOString().split('T')[0], depreciationRate: ''
  });
  const [showAddLiabilityForm, setShowAddLiabilityForm] = useState(false);
  const [newLiability, setNewLiability] = useState({
    name: '', type: 'Loan', amount: '', interestRate: '', repaymentDate: '', dueDate: ''
  });
  const [assetMessage, setAssetMessage] = useState('');
  const [liabilityMessage, setLiabilityMessage] = useState('');
  const [customerDebtMessage, setCustomerDebtMessage] = useState('');
  const [supplierDebtMessage, setSupplierDebtMessage] = useState('');

  const customerDebts = getCustomerDebts();
  const supplierDebts = getSupplierDebts();

  const handleAssetInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  const handleAssetSubmit = (e) => {
    e.preventDefault();
    addAsset({
      ...newAsset,
      purchaseValue: parseFloat(newAsset.purchaseValue),
      depreciationRate: parseFloat(newAsset.depreciationRate)
    });
    setAssetMessage('Asset added successfully!');
    setNewAsset({ name: '', purchaseValue: '', purchaseDate: new Date().toISOString().split('T')[0], depreciationRate: '' });
    setShowAddAssetForm(false);
    setTimeout(() => setAssetMessage(''), 5000); // Clear message after 5 seconds
  };

  const handleLiabilityInputChange = (e) => {
    const { name, value } = e.target;
    setNewLiability(prev => ({ ...prev, [name]: value }));
  };

  const handleLiabilitySubmit = (e) => {
    e.preventDefault();
    addLiability({
      ...newLiability,
      amount: parseFloat(newLiability.amount),
      interestRate: newLiability.type === 'Loan' ? parseFloat(newLiability.interestRate) : undefined,
    });
    setLiabilityMessage('Liability added successfully!');
    setNewLiability({ name: '', type: 'Loan', amount: '', interestRate: '', repaymentDate: '', dueDate: '' });
    setShowAddLiabilityForm(false);
    setTimeout(() => setLiabilityMessage(''), 5000); // Clear message after 5 seconds
  };

  const handleMarkCustomerPaid = (id) => {
    if (window.confirm('Are you sure you want to mark this customer debt as paid?')) {
      markCustomerDebtPaid(id);
      setCustomerDebtMessage('Customer debt marked as paid!');
      setTimeout(() => setCustomerDebtMessage(''), 5000); // Clear message after 5 seconds
    }
  };

  const handleMarkSupplierPaid = (id) => {
    if (window.confirm('Are you sure you want to mark this supplier debt as paid?')) {
      markSupplierDebtPaid(id);
      setSupplierDebtMessage('Supplier debt marked as paid!');
      setTimeout(() => setSupplierDebtMessage(''), 5000); // Clear message after 5 seconds
    }
  };

  const canManage = currentUser && ['admin', 'manager', 'accountant'].includes(currentUser.role);

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin, Manager or Accountant can access Assets, Liabilities & Debt.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Assets, Liabilities & Debt</h2>

      <div className="mb-6 flex flex-wrap space-x-4 space-y-2 md:space-y-0">
        <Button onClick={() => setShowAddAssetForm(true)}>Add New Asset</Button>
        <Button onClick={() => setShowAddLiabilityForm(true)} className="bg-blue-600 hover:bg-blue-700">Add New Liability</Button>
      </div>

      {assetMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
          {assetMessage}
        </div>
      )}
      {liabilityMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
          {liabilityMessage}
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
              <Button type="submit">Add Asset</Button>
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
              <Button type="submit">Add Liability</Button>
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
        {customerDebtMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
            {customerDebtMessage}
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
                <Button onClick={() => handleMarkCustomerPaid(debt.id)} className="bg-green-600 hover:bg-green-700">Mark Paid</Button>
              </td>
            </tr>
          )}
        />

        {supplierDebtMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md mt-4 mb-4">
            {supplierDebtMessage}
          </div>
        )}
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
                <Button onClick={() => handleMarkSupplierPaid(debt.id)} className="bg-green-600 hover:bg-green-700">Mark Paid</Button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

const AdminProfitLossReports = () => {
  const { sales, purchases, expenses, currentUser } = useContext(AppContext);
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
  const { users, setUsers, updateUserProfile, currentUser } = useContext(AppContext);
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

  const handleSaveRole = () => {
    if (editingUser) {
      updateUserProfile(editingUser.id, { role: newRole });
      setMessage(`Role for ${editingUser.username} updated to ${newRole}.`);
      setEditingUser(null);
      setNewRole('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const canManage = currentUser && currentUser.role === 'admin';

  if (!canManage) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only Admin can manage User Roles.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">User & Role Management</h2>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      {editingUser && (
        <Card title={`Edit Role for ${editingUser.username}`} className="mb-8">
          <Select
            label="New Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={roles}
          />
          <div className="flex space-x-4">
            <Button onClick={handleSaveRole}>Save Role</Button>
            <Button onClick={() => setEditingUser(null)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
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
                <Button onClick={() => handleEditRole(user)} className="bg-indigo-600 hover:bg-indigo-700">Edit Role</Button>
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
  const { currentUser, logout, currentPage, setCurrentPage } = useContext(AppContext);

  const renderPage = () => {
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
