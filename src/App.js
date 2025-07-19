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
            src="/images/cabbages.JPG"
            alt="Vibrant Cabbages"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Healthy Cabbage Field</p>
        </div>
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/pineapples.JPG"
            alt="Fresh Pineapples"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found"; }}
          />
          <p className="p-4 text-lg font-semibold text-gray-800">Fresh Pineapple Harvest</p>
        </div>
        <div className="rounded-lg shadow-md overflow-hidden">
          <img
            src="/images/rose flowers.JPG"
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
      <h2 className="text-3xl font-bold text-green-800 mb-6">Client Dashboard</h2>
      <Card title={`Welcome, ${currentUser.name}!`} className="mb-6">
        <p className="text-gray-700">Role: {currentUser.role}</p>
        <p className="text-gray-700">Farm Type: {currentUser.farmType || 'N/A'}</p>
        <p className="text-gray-700">Location: {currentUser.location || 'N/A'}</p>
        <p className="text-gray-700">Contact: {currentUser.contactInfo || 'N/A'}</p>
        <Button onClick={() => setCurrentPage('client-dashboard-profile')} className="mt-4 bg-purple-600 hover:bg-purple-700">Edit Profile</Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="My Orders">
          <Button onClick={() => setCurrentPage('client-dashboard-orders')} className="w-full bg-blue-600 hover:bg-blue-700">View My Orders</Button>
        </Card>
        <Card title="Place New Order">
          <Button onClick={() => setCurrentPage('client-dashboard-place-order')} className="w-full bg-green-600 hover:bg-green-700">Order Products</Button>
        </Card>
      </div>
    </div>
  );
};

const ClientOrders = () => {
  const { currentUser, orders, getProductById, setCurrentPage } = useContext(AppContext);

  if (!currentUser || currentUser.role !== 'client') {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as a client.</p>;
  }

  const clientOrders = orders.filter(order => order.clientId === currentUser.id);

  const headers = ['Order ID', 'Date', 'Total Amount', 'Status', 'Items', 'Invoice'];

  const renderRow = (order) => (
    <tr key={order.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.orderDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {order.totalAmount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {order.items.map(item => (
          <div key={item.productId}>
            {getProductById(item.productId)?.name} (x{item.quantity})
          </div>
        ))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
        {order.invoiceDetails}
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">My Orders</h2>
      <Button onClick={() => setCurrentPage('client-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>
      <Card>
        <Table headers={headers} data={clientOrders} renderRow={renderRow} />
      </Card>
      {clientOrders.length === 0 && <p className="mt-4 text-center text-gray-600">You haven't placed any orders yet.</p>}
    </div>
  );
};

const ClientPlaceOrder = () => {
  const { currentUser, products, placeOrder, setCurrentPage } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].id); // Select the first product by default
    }
  }, [products, selectedProduct]);

  if (!currentUser || currentUser.role !== 'client') {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as a client.</p>;
  }

  const handleAddItem = () => {
    setError('');
    const productToAdd = products.find(p => p.id === selectedProduct);
    if (!productToAdd) {
      setError('Please select a valid product.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (quantity > productToAdd.stock) {
      setError(`Not enough stock. Only ${productToAdd.stock} available.`);
      return;
    }

    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct);
    if (existingItemIndex > -1) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setOrderItems(updatedItems);
    } else {
      setOrderItems(prev => [...prev, {
        productId: productToAdd.id,
        quantity: quantity,
        unitPrice: productToAdd.price,
        name: productToAdd.name // Include name for display
      }]);
    }
    setQuantity(1); // Reset quantity after adding
  };

  const handleRemoveItem = (productId) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handlePlaceOrder = () => {
    setError('');
    if (orderItems.length === 0) {
      setError('Your order is empty. Please add some products.');
      return;
    }

    placeOrder(currentUser.id, orderItems);
    setOrderItems([]);
    setSuccessMessage('Order placed successfully! You can view it in "My Orders".');
    setTimeout(() => {
      setSuccessMessage('');
      setCurrentPage('client-dashboard-orders');
    }, 3000);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (Ksh ${p.price.toLocaleString()}) - Stock: ${p.stock}` }));

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Place New Order</h2>
      <Button onClick={() => setCurrentPage('client-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      <Card title="Add Products to Order" className="mb-6">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}
        <Select
          label="Select Product"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          options={productOptions}
          required
        />
        <Input
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
        />
        <Button onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700">Add to Order</Button>
      </Card>

      <Card title="Current Order" className="mb-6">
        {orderItems.length === 0 ? (
          <p className="text-gray-600">No items added to your order yet.</p>
        ) : (
          <>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              {orderItems.map(item => (
                <li key={item.productId} className="flex justify-between items-center py-1">
                  <span>{item.name} (x{item.quantity}) - Ksh {(item.quantity * item.unitPrice).toLocaleString()}</span>
                  <Button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="bg-red-500 hover:bg-red-600 px-2 py-1 text-sm"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-lg font-bold text-gray-800 mt-4">Total: Ksh {calculateTotal().toLocaleString()}</p>
            <Button onClick={handlePlaceOrder} className="w-full mt-4">Place Order</Button>
          </>
        )}
      </Card>
    </div>
  );
};

const ClientProfile = () => {
  const { currentUser, updateUserProfile, setCurrentPage } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    farmType: currentUser?.farmType || '',
    location: currentUser?.location || '',
    contactInfo: currentUser?.contactInfo || '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        farmType: currentUser.farmType || '',
        location: currentUser.location || '',
        contactInfo: currentUser.contactInfo || '',
      });
    }
  }, [currentUser]);


  if (!currentUser || currentUser.role !== 'client') {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as a client.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, formData);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Edit Profile</h2>
      <Button onClick={() => setCurrentPage('client-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>
      <Card>
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Farm Type" name="farmType" value={formData.farmType} onChange={handleChange} />
          <Input label="Location" name="location" value={formData.location} onChange={handleChange} required />
          <Input label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required />
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

// --- Admin Dashboard Components ---

const AdminDashboard = () => {
  const { currentUser, setCurrentPage, products, orders, sales, purchases, expenses, assets, liabilities } = useContext(AppContext);

  if (!currentUser || !['admin', 'manager', 'cashier'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied. Please login as an admin, manager, or cashier.</p>;
  }

  // Dashboard Summary Calculations
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel).length;
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  const totalSalesRevenue = sales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalCustomerDebts = sales.filter(s => s.isCredit && !s.paid).reduce((sum, s) => sum + s.amountDue, 0);

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Admin Dashboard</h2>
      <Card title={`Welcome, ${currentUser.name} (${currentUser.role})!`} className="mb-6">
        <p className="text-gray-700">Quick overview of your operations.</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Products" className="bg-blue-50 border-blue-200">
          <p className="text-3xl font-bold text-blue-700">{totalProducts}</p>
          <p className="text-gray-600">Total Products</p>
          <p className="text-red-500">{lowStockProducts} Low Stock Items</p>
          <Button onClick={() => setCurrentPage('admin-inventory')} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">Manage Inventory</Button>
        </Card>
        <Card title="Orders" className="bg-green-50 border-green-200">
          <p className="text-3xl font-bold text-green-700">{orders.length}</p>
          <p className="text-gray-600">Total Orders</p>
          <p className="text-yellow-600">{pendingOrders} Pending Orders</p>
          <Button onClick={() => setCurrentPage('admin-orders')} className="mt-4 w-full bg-green-600 hover:bg-green-700">View Orders</Button>
        </Card>
        <Card title="Sales Revenue" className="bg-purple-50 border-purple-200">
          <p className="text-3xl font-bold text-purple-700">Ksh {totalSalesRevenue.toLocaleString()}</p>
          <p className="text-gray-600">Total Sales (YTD)</p>
          <p className="text-orange-600">Ksh {totalCustomerDebts.toLocaleString()} Customer Debts</p>
          <Button onClick={() => setCurrentPage('admin-sales')} className="mt-4 w-full bg-purple-600 hover:bg-purple-700">View Sales</Button>
        </Card>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-4">Management Sections</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUser.role === 'admin' && (
          <Card title="User Management">
            <Button onClick={() => setCurrentPage('admin-users')} className="w-full bg-indigo-600 hover:bg-indigo-700">Manage Users</Button>
          </Card>
        )}
        <Card title="Purchases">
          <Button onClick={() => setCurrentPage('admin-purchases')} className="w-full bg-yellow-600 hover:bg-yellow-700">Manage Purchases</Button>
        </Card>
        <Card title="Expenses">
          <Button onClick={() => setCurrentPage('admin-expenses')} className="w-full bg-red-600 hover:bg-red-700">Manage Expenses</Button>
        </Card>
        {currentUser.role === 'admin' && (
          <>
            <Card title="Assets">
              <Button onClick={() => setCurrentPage('admin-assets')} className="w-full bg-teal-600 hover:bg-teal-700">Manage Assets</Button>
            </Card>
            <Card title="Liabilities">
              <Button onClick={() => setCurrentPage('admin-liabilities')} className="w-full bg-pink-600 hover:bg-pink-700">Manage Liabilities</Button>
            </Card>
          </>
        )}
        <Card title="Financial Overview">
          <Button onClick={() => setCurrentPage('admin-financials')} className="w-full bg-cyan-600 hover:bg-cyan-700">View Reports</Button>
        </Card>
      </div>
    </div>
  );
};

const AdminInventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, setCurrentPage, currentUser } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for new, object for edit
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: ''
  });
  const [message, setMessage] = useState('');

  // Reset form data when adding or editing changes
  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        name: '', description: '', category: '', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: ''
      });
    }
  }, [editingProduct, isAdding]);

  if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins and managers can manage inventory.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (editingProduct) {
      updateProduct(formData);
      setMessage('Product updated successfully!');
    } else {
      addProduct(formData);
      setMessage('Product added successfully!');
    }
    setIsAdding(false);
    setEditingProduct(null);
    setFormData({
      name: '', description: '', category: '', price: '', stock: '', reorderLevel: '', batch: '', expiryDate: '', supplierInfo: ''
    });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const headers = ['Name', 'Category', 'Price', 'Stock', 'Reorder Level', 'Batch', 'Expiry Date', 'Supplier', 'Actions'];

  const renderRow = (product) => (
    <tr key={product.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {product.price.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.stock}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.reorderLevel}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.batch}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.expiryDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.supplierInfo}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => { setEditingProduct(product); setIsAdding(true); }} className="bg-yellow-500 hover:bg-yellow-600 mr-2 text-xs">Edit</Button>
        <Button onClick={() => handleDelete(product.id)} className="bg-red-500 hover:bg-red-600 text-xs">Delete</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Inventory Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => { setIsAdding(true); setEditingProduct(null); }} className="bg-green-600 hover:bg-green-700">Add New Product</Button>
      </div>

      {(isAdding || editingProduct) && (
        <Card title={editingProduct ? "Edit Product" : "Add New Product"} className="mb-6">
          <form onSubmit={handleSubmit}>
            <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Description" name="description" value={formData.description} onChange={handleChange} required />
            <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
            <Input label="Price (Ksh)" name="price" type="number" value={formData.price} onChange={handleChange} min="0" required />
            <Input label="Stock Quantity" name="stock" type="number" value={formData.stock} onChange={handleChange} min="0" required />
            <Input label="Reorder Level" name="reorderLevel" type="number" value={formData.reorderLevel} onChange={handleChange} min="0" />
            <Input label="Batch" name="batch" value={formData.batch} onChange={handleChange} />
            <Input label="Expiry Date" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
            <Input label="Supplier Info" name="supplierInfo" value={formData.supplierInfo} onChange={handleChange} />
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">{editingProduct ? "Update Product" : "Create Product"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Products">
        <Table headers={headers} data={products} renderRow={renderRow} />
      </Card>
    </div>
  );
};

const AdminOrders = () => {
  const { orders, updateOrderStatus, getProductById, getUserById, setCurrentPage, currentUser } = useContext(AppContext);
  const [filterStatus, setFilterStatus] = useState('All');
  const orderStatuses = ['All', 'Pending', 'Delivered', 'Cancelled'];

  if (!currentUser || !['admin', 'manager', 'cashier'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied.</p>;
  }

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const headers = ['Order ID', 'Client Name', 'Order Date', 'Total Amount', 'Status', 'Items', 'Actions'];

  const renderRow = (order) => (
    <tr key={order.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getUserById(order.clientId)?.name || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.orderDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {order.totalAmount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {order.items.map(item => (
          <div key={item.productId}>
            {getProductById(item.productId)?.name} (x{item.quantity})
          </div>
        ))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Select
          value={order.status}
          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          options={orderStatuses.filter(s => s !== 'All').map(s => ({ value: s, label: s }))}
          className="w-32"
          name="status"
        />
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Order Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      <div className="mb-6 flex flex-wrap items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <label htmlFor="status-filter" className="font-semibold text-gray-700">Filter by Status:</label>
        <Select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={orderStatuses.map(status => ({ value: status, label: status }))}
          className="w-full sm:w-auto"
        />
      </div>

      <Card title="All Orders">
        <Table headers={headers} data={filteredOrders} renderRow={renderRow} />
      </Card>
    </div>
  );
};

const AdminSales = () => {
  const { sales, products, users, getCustomerDebts, markCustomerDebtPaid, setCurrentPage, currentUser } = useContext(AppContext);
  const [isRecordingSale, setIsRecordingSale] = useState(false);
  const [saleFormData, setSaleFormData] = useState({
    type: 'walk-in', customerName: '', clientId: '', productId: '', quantity: '', unitPrice: '', paymentMethod: 'Cash', isCredit: false, amountDue: '', dueDate: ''
  });
  const [message, setMessage] = useState('');

  if (!currentUser || !['admin', 'manager', 'cashier'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSaleFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isCredit' && !checked && { amountDue: '', dueDate: '' }), // Clear if not credit
      ...(name === 'productId' && value && { unitPrice: products.find(p => p.id === value)?.price || '' }) // Auto-fill price
    }));
  };

  const handleRecordSale = (e) => {
    e.preventDefault();
    setMessage('');
    const product = products.find(p => p.id === saleFormData.productId);
    if (!product || saleFormData.quantity > product.stock) {
      setMessage('Error: Insufficient stock or invalid product.');
      return;
    }

    const newSale = {
      ...saleFormData,
      quantity: parseInt(saleFormData.quantity),
      unitPrice: parseFloat(saleFormData.unitPrice),
      date: new Date().toISOString().split('T')[0],
      amountDue: saleFormData.isCredit ? parseFloat(saleFormData.amountDue || (saleFormData.quantity * saleFormData.unitPrice)) : 0,
      paid: !saleFormData.isCredit, // Mark as paid if not credit
    };
    recordSale(newSale);
    setMessage('Sale recorded successfully!');
    setIsRecordingSale(false);
    setSaleFormData({
      type: 'walk-in', customerName: '', clientId: '', productId: '', quantity: '', unitPrice: '', paymentMethod: 'Cash', isCredit: false, amountDue: '', dueDate: ''
    });
    setTimeout(() => setMessage(''), 3000);
  };

  const allSalesHeaders = ['Sale ID', 'Type', 'Customer', 'Product', 'Quantity', 'Unit Price', 'Total', 'Payment Method', 'Date', 'Credit Sale', 'Amount Due', 'Paid'];

  const renderAllSalesRow = (sale) => (
    <tr key={sale.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.customerName || getUserById(sale.clientId)?.name || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{products.find(p => p.id === sale.productId)?.name || 'Unknown'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {sale.unitPrice.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {(sale.quantity * sale.unitPrice).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.paymentMethod}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.isCredit ? 'Yes' : 'No'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{sale.isCredit && !sale.paid ? `Ksh ${sale.amountDue.toLocaleString()}` : '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.paid ? 'Yes' : 'No'}</td>
    </tr>
  );

  const customerDebtHeaders = ['Sale ID', 'Customer Name', 'Product', 'Quantity', 'Amount Due', 'Due Date', 'Overdue', 'Actions'];

  const renderCustomerDebtRow = (debt) => (
    <tr key={debt.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{debt.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.customerName || getUserById(debt.clientId)?.name || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.productName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">Ksh {debt.amountDue.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.dueDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{debt.isOverdue ? <span className="text-red-500">Yes</span> : 'No'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => markCustomerDebtPaid(debt.id)} className="bg-green-500 hover:bg-green-600 text-xs" disabled={debt.paid}>Mark Paid</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Sales Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsRecordingSale(true)} className="bg-green-600 hover:bg-green-700">Record New Sale</Button>
      </div>

      {isRecordingSale && (
        <Card title="Record New Sale" className="mb-6">
          <form onSubmit={handleRecordSale}>
            <Select
              label="Sale Type"
              name="type"
              value={saleFormData.type}
              onChange={handleChange}
              options={[{ value: 'walk-in', label: 'Walk-in' }, { value: 'online', label: 'Online' }]}
              required
            />
            {saleFormData.type === 'walk-in' ? (
              <Input label="Customer Name" name="customerName" value={saleFormData.customerName} onChange={handleChange} required />
            ) : (
              <Select
                label="Online Client"
                name="clientId"
                value={saleFormData.clientId}
                onChange={handleChange}
                options={[{ value: '', label: 'Select Client' }, ...users.filter(u => u.role === 'client').map(u => ({ value: u.id, label: u.name }))]}
                required
              />
            )}
            <Select
              label="Product"
              name="productId"
              value={saleFormData.productId}
              onChange={handleChange}
              options={[{ value: '', label: 'Select Product' }, ...products.map(p => ({ value: p.id, label: `${p.name} (Ksh ${p.price.toLocaleString()})` }))]}
              required
            />
            <Input label="Quantity" name="quantity" type="number" value={saleFormData.quantity} onChange={handleChange} min="1" required />
            <Input label="Unit Price (Ksh)" name="unitPrice" type="number" value={saleFormData.unitPrice} onChange={handleChange} min="0" required />
            <Select
              label="Payment Method"
              name="paymentMethod"
              value={saleFormData.paymentMethod}
              onChange={handleChange}
              options={[{ value: 'Cash', label: 'Cash' }, { value: 'M-Pesa', label: 'M-Pesa' }, { value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit', label: 'Credit' }]}
              required
            />
            <div>
              <input type="checkbox" id="isCredit" name="isCredit" checked={saleFormData.isCredit} onChange={handleChange} className="mr-2" />
              <label htmlFor="isCredit" className="text-gray-700">Credit Sale?</label>
            </div>
            {saleFormData.isCredit && (
              <>
                <Input label="Amount Due (Ksh)" name="amountDue" type="number" value={saleFormData.amountDue} onChange={handleChange} />
                <Input label="Due Date" name="dueDate" type="date" value={saleFormData.dueDate} onChange={handleChange} />
              </>
            )}
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsRecordingSale(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">Record Sale</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Customer Debts" className="mb-6">
        <Table headers={customerDebtHeaders} data={getCustomerDebts()} renderRow={renderCustomerDebtRow} />
      </Card>

      <Card title="All Sales">
        <Table headers={allSalesHeaders} data={sales} renderRow={renderAllSalesRow} />
      </Card>
    </div>
  );
};

const AdminPurchases = () => {
  const { purchases, products, recordPurchase, getSupplierDebts, markSupplierDebtPaid, setCurrentPage, currentUser } = useContext(AppContext);
  const [isRecordingPurchase, setIsRecordingPurchase] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState({
    supplierName: '', productId: '', quantity: '', cost: '', isCredit: false, amountDue: '', dueDate: ''
  });
  const [message, setMessage] = useState('');

  if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins and managers can manage purchases.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPurchaseFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isCredit' && !checked && { amountDue: '', dueDate: '' }), // Clear if not credit
    }));
  };

  const handleRecordPurchase = (e) => {
    e.preventDefault();
    setMessage('');
    const newPurchase = {
      ...purchaseFormData,
      quantity: parseInt(purchaseFormData.quantity),
      cost: parseFloat(purchaseFormData.cost),
      date: new Date().toISOString().split('T')[0],
      amountDue: purchaseFormData.isCredit ? parseFloat(purchaseFormData.amountDue || (purchaseFormData.quantity * purchaseFormData.cost)) : 0,
      paid: !purchaseFormData.isCredit, // Mark as paid if not credit
    };
    recordPurchase(newPurchase);
    setMessage('Purchase recorded successfully!');
    setIsRecordingPurchase(false);
    setPurchaseFormData({
      supplierName: '', productId: '', quantity: '', cost: '', isCredit: false, amountDue: '', dueDate: ''
    });
    setTimeout(() => setMessage(''), 3000);
  };

  const allPurchasesHeaders = ['Purchase ID', 'Supplier', 'Product', 'Quantity', 'Cost per Unit', 'Total Cost', 'Date', 'Credit Purchase', 'Amount Due', 'Paid'];

  const renderAllPurchasesRow = (purchase) => (
    <tr key={purchase.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{purchase.supplierName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{products.find(p => p.id === purchase.productId)?.name || 'Unknown'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{purchase.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {purchase.cost.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {(purchase.quantity * purchase.cost).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{purchase.date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{purchase.isCredit ? 'Yes' : 'No'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{purchase.isCredit && !purchase.paid ? `Ksh ${purchase.amountDue.toLocaleString()}` : '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{purchase.paid ? 'Yes' : 'No'}</td>
    </tr>
  );

  const supplierDebtHeaders = ['Purchase ID', 'Supplier', 'Product', 'Quantity', 'Amount Due', 'Due Date', 'Overdue', 'Actions'];

  const renderSupplierDebtRow = (debt) => (
    <tr key={debt.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{debt.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.supplierName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.productName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">Ksh {debt.amountDue.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.dueDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{debt.isOverdue ? <span className="text-red-500">Yes</span> : 'No'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => markSupplierDebtPaid(debt.id)} className="bg-green-500 hover:bg-green-600 text-xs" disabled={debt.paid}>Mark Paid</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Purchase Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsRecordingPurchase(true)} className="bg-green-600 hover:bg-green-700">Record New Purchase</Button>
      </div>

      {isRecordingPurchase && (
        <Card title="Record New Purchase" className="mb-6">
          <form onSubmit={handleRecordPurchase}>
            <Input label="Supplier Name" name="supplierName" value={purchaseFormData.supplierName} onChange={handleChange} required />
            <Select
              label="Product"
              name="productId"
              value={purchaseFormData.productId}
              onChange={handleChange}
              options={[{ value: '', label: 'Select Product' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
              required
            />
            <Input label="Quantity" name="quantity" type="number" value={purchaseFormData.quantity} onChange={handleChange} min="1" required />
            <Input label="Cost per Unit (Ksh)" name="cost" type="number" value={purchaseFormData.cost} onChange={handleChange} min="0" required />
            <div>
              <input type="checkbox" id="isCreditPurchase" name="isCredit" checked={purchaseFormData.isCredit} onChange={handleChange} className="mr-2" />
              <label htmlFor="isCreditPurchase" className="text-gray-700">Credit Purchase?</label>
            </div>
            {purchaseFormData.isCredit && (
              <>
                <Input label="Amount Due (Ksh)" name="amountDue" type="number" value={purchaseFormData.amountDue} onChange={handleChange} />
                <Input label="Due Date" name="dueDate" type="date" value={purchaseFormData.dueDate} onChange={handleChange} />
              </>
            )}
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsRecordingPurchase(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">Record Purchase</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Supplier Debts" className="mb-6">
        <Table headers={supplierDebtHeaders} data={getSupplierDebts()} renderRow={renderSupplierDebtRow} />
      </Card>

      <Card title="All Purchases">
        <Table headers={allPurchasesHeaders} data={purchases} renderRow={renderAllPurchasesRow} />
      </Card>
    </div>
  );
};

const AdminExpenses = () => {
  const { expenses, addExpense, setExpenses, setCurrentPage, currentUser } = useContext(AppContext);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [formData, setFormData] = useState({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [message, setMessage] = useState('');

  if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins and managers can manage expenses.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    addExpense({ ...formData, amount: parseFloat(formData.amount) });
    setMessage('Expense added successfully!');
    setIsAddingExpense(false);
    setFormData({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      setMessage('Expense deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const headers = ['ID', 'Description', 'Category', 'Amount (Ksh)', 'Date', 'Actions'];

  const renderRow = (expense) => (
    <tr key={expense.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.description}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {expense.amount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => handleDelete(expense.id)} className="bg-red-500 hover:bg-red-600 text-xs">Delete</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Expense Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsAddingExpense(true)} className="bg-green-600 hover:bg-green-700">Add New Expense</Button>
      </div>

      {isAddingExpense && (
        <Card title="Add New Expense" className="mb-6">
          <form onSubmit={handleSubmit}>
            <Input label="Description" name="description" value={formData.description} onChange={handleChange} required />
            <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
            <Input label="Amount (Ksh)" name="amount" type="number" value={formData.amount} onChange={handleChange} min="0" required />
            <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsAddingExpense(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Expenses">
        <Table headers={headers} data={expenses} renderRow={renderRow} />
      </Card>
    </div>
  );
};

const AdminAssets = () => {
  const { assets, addAsset, setAssets, calculateCurrentValue, setCurrentPage, currentUser } = useContext(AppContext);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [formData, setFormData] = useState({ name: '', purchaseValue: '', purchaseDate: '', depreciationRate: '' });
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins can manage assets.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    addAsset({
      ...formData,
      purchaseValue: parseFloat(formData.purchaseValue),
      depreciationRate: parseFloat(formData.depreciationRate)
    });
    setMessage('Asset added successfully!');
    setIsAddingAsset(false);
    setFormData({ name: '', purchaseValue: '', purchaseDate: '', depreciationRate: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(prev => prev.filter(asset => asset.id !== id));
      setMessage('Asset deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const headers = ['ID', 'Name', 'Purchase Value (Ksh)', 'Purchase Date', 'Depreciation Rate', 'Current Value (Ksh)', 'Actions'];

  const renderRow = (asset) => (
    <tr key={asset.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asset.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {asset.purchaseValue.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asset.purchaseDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(asset.depreciationRate * 100).toFixed(1)}%</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {calculateCurrentValue(asset).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => handleDelete(asset.id)} className="bg-red-500 hover:bg-red-600 text-xs">Delete</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Asset Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsAddingAsset(true)} className="bg-green-600 hover:bg-green-700">Add New Asset</Button>
      </div>

      {isAddingAsset && (
        <Card title="Add New Asset" className="mb-6">
          <form onSubmit={handleSubmit}>
            <Input label="Asset Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Purchase Value (Ksh)" name="purchaseValue" type="number" value={formData.purchaseValue} onChange={handleChange} min="0" required />
            <Input label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} required />
            <Input label="Annual Depreciation Rate (e.g., 0.15 for 15%)" name="depreciationRate" type="number" value={formData.depreciationRate} onChange={handleChange} min="0" max="1" step="0.01" required />
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsAddingAsset(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">Add Asset</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Assets">
        <Table headers={headers} data={assets} renderRow={renderRow} />
      </Card>
    </div>
  );
};

const AdminLiabilities = () => {
  const { liabilities, addLiability, setLiabilities, setCurrentPage, currentUser } = useContext(AppContext);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', amount: '', interestRate: '', repaymentDate: '', dueDate: '' });
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins can manage liabilities.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    addLiability({
      ...formData,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate) || 0 // Default to 0 if not provided
    });
    setMessage('Liability added successfully!');
    setIsAddingLiability(false);
    setFormData({ name: '', type: '', amount: '', interestRate: '', repaymentDate: '', dueDate: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      setLiabilities(prev => prev.filter(lib => lib.id !== id));
      setMessage('Liability deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const headers = ['ID', 'Name', 'Type', 'Amount (Ksh)', 'Interest Rate', 'Repayment/Due Date', 'Actions'];

  const renderRow = (liability) => (
    <tr key={liability.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{liability.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{liability.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{liability.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Ksh {liability.amount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{liability.interestRate ? `${(liability.interestRate * 100).toFixed(1)}%` : 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{liability.repaymentDate || liability.dueDate || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => handleDelete(liability.id)} className="bg-red-500 hover:bg-red-600 text-xs">Delete</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Liability Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsAddingLiability(true)} className="bg-green-600 hover:bg-green-700">Add New Liability</Button>
      </div>

      {isAddingLiability && (
        <Card title="Add New Liability" className="mb-6">
          <form onSubmit={handleSubmit}>
            <Input label="Liability Name" name="name" value={formData.name} onChange={handleChange} required />
            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[{ value: '', label: 'Select Type' }, { value: 'Loan', label: 'Loan' }, { value: 'Taxes', label: 'Taxes' }, { value: 'Accounts Payable', label: 'Accounts Payable' }, { value: 'Other', label: 'Other' }]}
              required
            />
            <Input label="Amount (Ksh)" name="amount" type="number" value={formData.amount} onChange={handleChange} min="0" required />
            {formData.type === 'Loan' && (
              <Input label="Interest Rate (e.g., 0.12 for 12%)" name="interestRate" type="number" value={formData.interestRate} onChange={handleChange} min="0" step="0.01" />
            )}
            <Input
              label={formData.type === 'Loan' ? "Repayment Date" : "Due Date"}
              name={formData.type === 'Loan' ? "repaymentDate" : "dueDate"}
              type="date"
              value={formData.repaymentDate || formData.dueDate}
              onChange={handleChange}
              required
            />
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setIsAddingLiability(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">Add Liability</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Liabilities">
        <Table headers={headers} data={liabilities} renderRow={renderRow} />
      </Card>
    </div>
  );
};


const AdminUsers = () => {
  const { users, currentUser, updateUserProfile, deleteUser, setCurrentPage } = useContext(AppContext);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins can manage users.</p>;
  }

  useEffect(() => {
    if (editingUser) {
      setFormData(editingUser);
    } else {
      setFormData({});
    }
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (editingUser) {
      updateUserProfile(editingUser.id, formData);
      setMessage('User updated successfully!');
      setEditingUser(null);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (userId) => {
    if (currentUser.id === userId) {
      alert("You cannot delete your own user account from here.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user ${users.find(u => u.id === userId)?.username}?`)) {
      deleteUser(userId);
      setMessage('User deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const headers = ['ID', 'Username', 'Name', 'Role', 'Farm Type', 'Location', 'Contact Info', 'Actions'];

  const renderRow = (user) => (
    <tr key={user.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.username}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.farmType || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.location || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.contactInfo || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button onClick={() => setEditingUser(user)} className="bg-yellow-500 hover:bg-yellow-600 mr-2 text-xs">Edit</Button>
        <Button onClick={() => handleDelete(user.id)} className="bg-red-500 hover:bg-red-600 text-xs" disabled={currentUser.id === user.id}>Delete</Button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">User Management</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{message}</div>}

      {editingUser && (
        <Card title={`Edit User: ${editingUser.username}`} className="mb-6">
          <form onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Username" name="username" value={formData.username} onChange={handleChange} required disabled={true} /> {/* Username should not be editable easily */}
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'cashier', label: 'Cashier' },
                { value: 'client', label: 'Client' },
              ]}
              required
              disabled={currentUser.id === editingUser.id} // Prevent changing own role
            />
            {formData.role === 'client' && (
              <>
                <Input label="Farm Type" name="farmType" value={formData.farmType || ''} onChange={handleChange} />
                <Input label="Location" name="location" value={formData.location || ''} onChange={handleChange} />
                <Input label="Contact Info" name="contactInfo" value={formData.contactInfo || ''} onChange={handleChange} />
              </>
            )}
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" onClick={() => setEditingUser(null)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Users">
        <Table headers={headers} data={users} renderRow={renderRow} />
      </Card>
    </div>
  );
};


const AdminFinancialReports = () => {
  const { sales, purchases, expenses, assets, liabilities, calculateCurrentValue, setCurrentPage, currentUser } = useContext(AppContext);

  if (!currentUser || currentUser.role !== 'admin') {
    return <p className="text-center text-red-500 p-8">Access Denied. Only admins can view financial reports.</p>;
  }

  // Calculate Net Income (Simplified)
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0);
  const totalCostOfPurchases = purchases.reduce((sum, purchase) => sum + (purchase.quantity * purchase.cost), 0);
  const totalOperatingExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = totalRevenue - totalCostOfPurchases - totalOperatingExpenses;

  // Calculate Total Assets
  const totalAssets = assets.reduce((sum, asset) => sum + calculateCurrentValue(asset), 0);

  // Calculate Total Liabilities
  const totalLiabilities = liabilities.reduce((sum, lib) => sum + lib.amount, 0);

  // Calculate Equity
  const equity = totalAssets - totalLiabilities;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Financial Reports</h2>
      <Button onClick={() => setCurrentPage('admin-dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">Back to Dashboard</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Total Revenue" className="bg-blue-50">
          <p className="text-3xl font-bold text-blue-700">Ksh {totalRevenue.toLocaleString()}</p>
        </Card>
        <Card title="Total Expenses" className="bg-red-50">
          <p className="text-3xl font-bold text-red-700">Ksh {totalOperatingExpenses.toLocaleString()}</p>
        </Card>
        <Card title="Net Income" className={netIncome >= 0 ? "bg-green-50" : "bg-red-50"}>
          <p className={`text-3xl font-bold ${netIncome >= 0 ? "text-green-700" : "text-red-700"}`}>Ksh {netIncome.toLocaleString()}</p>
        </Card>
        <Card title="Total Assets" className="bg-purple-50">
          <p className="text-3xl font-bold text-purple-700">Ksh {totalAssets.toLocaleString()}</p>
        </Card>
        <Card title="Total Liabilities" className="bg-orange-50">
          <p className="text-3xl font-bold text-orange-700">Ksh {totalLiabilities.toLocaleString()}</p>
        </Card>
        <Card title="Equity" className="bg-yellow-50">
          <p className="text-3xl font-bold text-yellow-700">Ksh {equity.toLocaleString()}</p>
        </Card>
      </div>

      <Card title="Revenue Breakdown (Example)">
        <p className="text-gray-700">Total Sales: Ksh {totalRevenue.toLocaleString()}</p>
        <p className="text-gray-700">Cost of Goods Sold (Purchases): Ksh {totalCostOfPurchases.toLocaleString()}</p>
      </Card>

      <Card title="Expense Categories Overview" className="mt-6">
        {Object.entries(expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {})).map(([category, amount]) => (
          <p key={category} className="text-gray-700">{category}: Ksh {amount.toLocaleString()}</p>
        ))}
        {expenses.length === 0 && <p className="text-gray-600">No expenses recorded.</p>}
      </Card>

      <Card title="Asset Value Trends (Conceptual)" className="mt-6">
        <p className="text-gray-600">Graphical representation of asset depreciation over time could go here.</p>
        <div className="bg-gray-100 h-48 flex items-center justify-center text-gray-500 rounded-md mt-2">
          [Chart Placeholder: e.g., for asset depreciation or sales over time]
        </div>
      </Card>

      <Card title="Debt Overview" className="mt-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-2">Customer Debts</h4>
        <Table
          headers={['Customer', 'Amount Due', 'Due Date']}
          data={sales.filter(s => s.isCredit && !s.paid)}
          renderRow={(debt) => (
            <tr key={debt.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.customerName || `Client ${debt.clientId}`}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Ksh {debt.amountDue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.dueDate}</td>
            </tr>
          )}
        />
        <h4 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Supplier Debts</h4>
        <Table
          headers={['Supplier', 'Amount Due', 'Due Date']}
          data={purchases.filter(p => p.isCredit && !p.paid)}
          renderRow={(debt) => (
            <tr key={debt.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.supplierName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Ksh {debt.amountDue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{debt.dueDate}</td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};


// --- Main App Component ---
const Header = () => {
  const { currentUser, logout, setCurrentPage } = useContext(AppContext);

  return (
    <header className="bg-green-700 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 onClick={() => setCurrentPage('home')} className="text-3xl font-bold cursor-pointer hover:text-green-200 transition-colors">
          BestLine
        </h1>
        <ul className="flex space-x-6 items-center">
          <li><button onClick={() => setCurrentPage('home')} className="hover:text-green-200 transition-colors">Home</button></li>
          <li><button onClick={() => setCurrentPage('about')} className="hover:text-green-200 transition-colors">About Us</button></li>
          <li><button onClick={() => setCurrentPage('products')} className="hover:text-green-200 transition-colors">Products</button></li>
          <li><button onClick={() => setCurrentPage('contact')} className="hover:text-green-200 transition-colors">Contact Us</button></li>
          {currentUser ? (
            <>
              <li>
                <button
                  onClick={() => setCurrentPage(currentUser.role === 'client' ? 'client-dashboard' : 'admin-dashboard')}
                  className="bg-green-600 hover:bg-green-800 px-3 py-1 rounded-md transition-colors"
                >
                  {currentUser.role === 'client' ? 'Client Dashboard' : 'Admin Dashboard'}
                </button>
              </li>
              <li>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors">
                  Logout ({currentUser.username})
                </button>
              </li>
            </>
          ) : (
            <>
              <li><button onClick={() => setCurrentPage('login')} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors">Login</button></li>
              <li><button onClick={() => setCurrentPage('signup')} className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md transition-colors">Sign Up</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-800 text-white p-6 text-center mt-auto">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="mb-4 md:mb-0">
          <h4 className="text-xl font-semibold mb-2">BestLine Agro-Chemicals</h4>
          <p className="text-gray-400">“Reliable Chemicals, Sustainable Harvests.”</p>
        </div>
        <div className="flex space-x-6">
          <button onClick={() => window.open('https://facebook.com/bestlineagro', '_blank')} className="text-gray-400 hover:text-white transition-colors text-2xl"><i className="fab fa-facebook"></i></button>
          <button onClick={() => window.open('https://twitter.com/bestlineagro', '_blank')} className="text-gray-400 hover:text-white transition-colors text-2xl"><i className="fab fa-twitter"></i></button>
          <button onClick={() => window.open('https://instagram.com/bestlineagro', '_blank')} className="text-gray-400 hover:text-white transition-colors text-2xl"><i className="fab fa-instagram"></i></button>
          <button onClick={() => window.open('https://linkedin.com/company/bestlineagro', '_blank')} className="text-gray-400 hover:text-white transition-colors text-2xl"><i className="fab fa-linkedin"></i></button>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} BestLine. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const App = () => {
  const { currentPage, currentUser } = useContext(AppContext);

  // Render different pages based on currentPage state
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
      // Client Dashboard routes
      case 'client-dashboard':
        return <ClientDashboard />;
      case 'client-dashboard-orders':
        return <ClientOrders />;
      case 'client-dashboard-place-order':
        return <ClientPlaceOrder />;
      case 'client-dashboard-profile':
        return <ClientProfile />;
      // Admin Dashboard routes
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-inventory':
        return <AdminInventory />;
      case 'admin-orders':
        return <AdminOrders />;
      case 'admin-sales':
        return <AdminSales />;
      case 'admin-purchases':
        return <AdminPurchases />;
      case 'admin-expenses':
        return <AdminExpenses />;
      case 'admin-assets':
        return <AdminAssets />;
      case 'admin-liabilities':
        return <AdminLiabilities />;
      case 'admin-users':
        return <AdminUsers />;
      case 'admin-financials':
        return <AdminFinancialReports />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

// This is the crucial line for resolving the build error
export default function MainApp() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
