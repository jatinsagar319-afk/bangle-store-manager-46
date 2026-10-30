/* ==========================================
   BANGLE STORE MANAGER
   Main JavaScript File
   Version: 1.0
========================================== */

"use strict";

// App storage keys
const STORAGE_KEYS = {
    products: "bs_products",
    sections: "bs_sections",
    bills: "bs_bills",
    designs: "bs_designs",
    daily: "bs_daily",
    settings: "bs_settings"
};

// Default app settings
const DEFAULT_SETTINGS = {
    lowStockLimit: 5,
    shopName: "Bangle Store",
    currency: "₹"
};


/* ==========================================
   STORAGE FUNCTIONS
========================================== */

// Read saved data safely
function getData(key, fallback = []) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) {
            return fallback;
        }

        return JSON.parse(saved);

    } catch (error) {
        console.error("Storage read error:", error);
        return fallback;
    }
}

// Save data safely
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;

    } catch (error) {
        console.error("Storage save error:", error);
        showMessage("डेटा सेव नहीं हो पाया। फोन की Storage चेक करें।");
        return false;
    }
}

// Get numeric value safely
function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}


/* ==========================================
   INITIAL APP DATA
========================================== */

function initializeApp() {

    // Create default sections only if not already saved
    if (localStorage.getItem(STORAGE_KEYS.sections) === null) {

        const defaultSections = [
            {
                id: "sec1",
                name: "24 Pc Box",
                description: "Velvet Churi"
            },
            {
                id: "sec2",
                name: "12 Pc Box",
                description: "Kundan / Nug Churi"
            },
            {
                id: "sec3",
                name: "Daily Use 24 Pc Box",
                description: "Daily Use Bangles"
            },
            {
                id: "sec4",
                name: "Other Inventory",
                description: "Other Products"
            }
        ];

        saveData(STORAGE_KEYS.sections, defaultSections);
    }

    // Create default settings only if missing
    if (localStorage.getItem(STORAGE_KEYS.settings) === null) {
        saveData(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    }

    // Update dashboard
    updateDashboard();
}


/* ==========================================
   DASHBOARD
========================================== */

function updateDashboard() {

    const products = getData(STORAGE_KEYS.products, []);
    const bills = getData(STORAGE_KEYS.bills, []);
    const settings = getData(
        STORAGE_KEYS.settings,
        DEFAULT_SETTINGS
    );

    const lowStockLimit = getNumber(
        settings.lowStockLimit ?? 5
    );

    // Count product records
    const totalProducts = products.length;

    // Calculate total sales
    const totalSales = bills.reduce((sum, bill) => {

        const amount = getNumber(
            bill.total ??
            bill.grandTotal ??
            bill.netAmount ??
            bill.amount ??
            0
        );

        return sum + amount;

    }, 0);

    // Find low stock products
    const lowStock = products.filter(product => {

        const quantity = getNumber(
            product.quantity ??
            product.stock ??
            product.qty ??
            product.availableQty ??
            0
        );

        return quantity <= lowStockLimit;

    }).length;

    // Update dashboard values
    setText("totalProducts", totalProducts);

    setText(
        "totalSales",
        "₹" + totalSales.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        })
    );

    setText("lowStock", lowStock);
}


// Update an HTML element by ID
function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* ==========================================
   DASHBOARD BUTTONS
========================================== */

// Show message on the dashboard
function showMessage(message) {

    const messageBox = document.getElementById("message");

    if (messageBox) {
        messageBox.textContent = message;
    }

    console.log("App:", message);
}

// Make function available to HTML onclick buttons
window.showMessage = showMessage;


/* ==========================================
   MODULE NAVIGATION
========================================== */

function openModule(moduleName) {

    const messages = {

        "Inventory":
            "Inventory मॉड्यूल अगला बनाया जाएगा।",

        "AI Set Maker":
            "AI Set Maker मॉड्यूल तैयार किया जाएगा।",

        "New Sale":
            "New Sale मॉड्यूल अगला बनाया जाएगा।",

        "Bills":
            "आपके Bills मॉड्यूल को अगला बनाया जाएगा।",

        "Reports":
            "Sale Reports मॉड्यूल अगला बनाया जाएगा।",

        "Daily Parcha":
            "Daily Parcha मॉड्यूल अगला बनाया जाएगा।",

        "Settings":
            "Settings मॉड्यूल अगला बनाया जाएगा।"
    };

    showMessage(
        messages[moduleName] ||
        "यह मॉड्यूल उपलब्ध नहीं है।"
    );
}


/* ==========================================
   INVENTORY DATA HELPERS
========================================== */

// Get all products
function getProducts() {
    return getData(STORAGE_KEYS.products, []);
}

// Add a product
function addProduct(product) {

    if (!product || !product.name) {
        showMessage("Product का नाम जरूरी है।");
        return false;
    }

    const products = getProducts();

    // Generate unique product ID
    const newProduct = {
        id: "PROD-" + Date.now(),
        sectionId: product.sectionId || "sec4",
        sku: product.sku || "",
        name: product.name,
        brand: product.brand || "",
        color: product.color || "",
        size: product.size || "",
        purchasePrice: getNumber(product.purchasePrice),
        sellingPrice: getNumber(product.sellingPrice),
        quantity: getNumber(product.quantity),
        image: product.image || "",
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);

    const saved = saveData(
        STORAGE_KEYS.products,
        products
    );

    if (saved) {
        updateDashboard();
        showMessage("Product सेव हो गया।");
    }

    return saved;
}


/* ==========================================
   BILL DATA HELPERS
========================================== */

// Get all bills
function getBills() {
    return getData(STORAGE_KEYS.bills, []);
}

// Save a bill
function saveBill(bill) {

    if (!bill) {
        showMessage("Bill का डेटा उपलब्ध नहीं है।");
        return false;
    }

    const bills = getBills();

    const newBill = {
        ...bill,
        id: bill.id || "BILL-" + Date.now(),
        createdAt: new Date().toISOString()
    };

    bills.push(newBill);

    const saved = saveData(
        STORAGE_KEYS.bills,
        bills
    );

    if (saved) {
        updateDashboard();
        showMessage("Bill सेव हो गया।");
    }

    return saved;
}


/* ==========================================
   APP INFORMATION
========================================== */

function getAppInfo() {

    return {
        appName: "Bangle Store Manager",
        version: "1.0",
        products: getProducts().length,
        bills: getBills().length
    };
}


/* ==========================================
   START APP
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializeApp();

    console.log(
        "Bangle Store Manager Started",
        getAppInfo()
    );

});

// Refresh dashboard when returning to the app
document.addEventListener("visibilitychange", function () {

    if (!document.hidden) {
        updateDashboard();
    }

});

