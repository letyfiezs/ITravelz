document.addEventListener("DOMContentLoaded", function () {
  const loginContainer = document.getElementById("login-container");
  const dashboardContainer = document.querySelector(".admin-dashboard");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.querySelector(".logout-btn");
  const navItems = document.querySelectorAll(".nav-item");
  const contentSections = document.querySelectorAll(".content-section");

  // Check if user is logged in as admin
  checkAdminAuth();

  // If already authenticated via login.html, skip login page
  const adminData = localStorage.getItem("adminLoggedIn");
  if (adminData) {
    loginContainer.style.display = "none";
    dashboardContainer.style.display = "flex";
    loadDashboard();
    loadUserInfo();
  } else {
    // Show legacy login form if not authenticated
    setupLoginForm();
  }

  // Login functionality (authenticate against backend database)
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("username")?.value;
      const password = document.getElementById("password")?.value;

      authenticateUserWithDatabase(email, password);
    });
  }

  // Logout functionality
  logoutBtn.addEventListener("click", function () {
    adminLogout();
  });

  // Navigation item click handlers
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("data-section");
      showSection(sectionId);

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Add event listeners to action buttons
  setupActionButtons();
  setupFilterButtons();
  setupSettingsForm();
  setupContentManagement();
});

const ADMIN_CONTENT_PERMISSIONS_KEY = "adminContentPermissions";
const SITE_CONTENT_OVERRIDES_KEY = "siteContentOverrides";

const defaultContentPermissions = {
  canChangeImage: true,
  canChangeTitle: true,
  canChangeParagraph: true,
  canChangeOther: true,
};

// Authentication - Database-backed with role verification
async function authenticateUserWithDatabase(email, password) {
  const loginBtn = document.querySelector(".login-btn");
  const originalBtnText = loginBtn.textContent;
  
  try {
    // Disable button during request
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Check if user has admin role
    if (data.data.role !== "admin") {
      throw new Error("Access Denied: You must be an admin to access this panel");
    }

    // Store admin data with token
    const adminData = {
      id: data.data.id,
      name: data.data.name,
      email: data.data.email,
      role: data.data.role,
      token: data.token,
      loginTime: new Date(),
    };

    localStorage.setItem("adminLoggedIn", JSON.stringify(adminData));
    localStorage.setItem("adminToken", data.token);

    // Show dashboard
    document.getElementById("login-container").style.display = "none";
    document.querySelector(".admin-dashboard").style.display = "flex";
    loadDashboard();
    loadUserInfo();
  } catch (error) {
    console.error("Login error:", error);
    alert(`Login Failed: ${error.message}`);
    
    // Clear password field
    const passwordField = document.getElementById("password");
    if (passwordField) {
      passwordField.value = "";
    }
  } finally {
    // Re-enable button
    loginBtn.disabled = false;
    loginBtn.textContent = originalBtnText;
  }
}

function authenticateUser(username, password) {
  return username === "admin" && password === "admin123";
}

function checkAdminAuth() {
  const loginContainer = document.getElementById("login-container");
  const dashboardContainer = document.querySelector(".admin-dashboard");
  const adminData = localStorage.getItem("adminLoggedIn");
  const token = localStorage.getItem("adminToken");

  if (adminData && token) {
    try {
      const admin = JSON.parse(adminData);
      // Verify the user still has admin role
      if (admin.role === "admin") {
        if (loginContainer) loginContainer.style.display = "none";
        if (dashboardContainer) dashboardContainer.style.display = "flex";
        loadDashboard();
        loadUserInfo();
        return;
      }
    } catch (e) {
      console.error("Error parsing admin data:", e);
    }
  }

  // If no valid session, show login
  if (loginContainer) loginContainer.style.display = "flex";
  if (dashboardContainer) dashboardContainer.style.display = "none";
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminToken");
}

function checkAuthStatus() {
  checkAdminAuth();
}

function adminLogout() {
  const confirmation = confirm("Are you sure you want to logout?");
  if (confirmation) {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("rememberEmail");
    document.getElementById("login-form").reset();
    document.getElementById("login-container").style.display = "flex";
    document.querySelector(".admin-dashboard").style.display = "none";
  }
}

function logout() {
  adminLogout();
}

function loadUserInfo() {
  const adminData = localStorage.getItem("adminLoggedIn");
  if (adminData) {
    try {
      const admin = JSON.parse(adminData);
      const adminNameElement = document.getElementById("admin-name");
      if (adminNameElement) {
        adminNameElement.textContent = admin.name || "Admin User";
      }
      console.log("Admin user loaded:", admin.name);
    } catch (e) {
      console.error("Error loading user info:", e);
    }
  }
}

function setupLoginForm() {
  // Setup for the legacy login form in admin panel
  // This is a placeholder for future enhancements
  console.log("Login form ready");
}

// Section Navigation
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("page-title");

  sections.forEach((section) => {
    section.classList.remove("active");
  });

  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add("active");
    updatePageTitle(sectionId);
  }
}

function updatePageTitle(sectionId) {
  const pageTitle = document.getElementById("page-title");
  const titles = {
    dashboard: "Dashboard",
    packages: "Travel Packages",
    destinations: "Destinations",
    itineraries: "Itineraries",
    bookings: "Bookings & Reservations",
    messages: "Contact Messages",
    users: "Users Management",
    settings: "Settings",
  };

  pageTitle.textContent = titles[sectionId] || "Dashboard";
}

// Dashboard
function loadDashboard() {
  showSection("dashboard");
  updateStats();
  displayRecentBookings();
  displayActivityLog();

  // Set active nav item
  const dashboardNav = document.querySelector('[data-section="dashboard"]');
  if (dashboardNav) {
    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));
    dashboardNav.classList.add("active");
  }
}

function updateStats() {
  // Simulate loading stats from backend
  const stats = {
    packages: 12,
    bookings: 245,
    revenue: 45230,
    messages: 18,
  };

  // Stats would be updated dynamically in real app
  console.log("Stats updated:", stats);
}

function displayRecentBookings() {
  const bookingsList = document.querySelector(
    '[data-section="dashboard"] .recent-bookings tbody',
  );
  if (!bookingsList) return;

  // In a real app, this would fetch from backend
  const bookings = [
    {
      id: "#BK001",
      customer: "Sarah Johnson",
      package: "Caribbean Island Escape",
      date: "2024-01-15",
      amount: "$1,299",
    },
    {
      id: "#BK002",
      customer: "Mike Wilson",
      package: "Alpine Peak Trek",
      date: "2024-01-14",
      amount: "$1,599",
    },
    {
      id: "#BK003",
      customer: "Emily Brown",
      package: "Ancient Civilizations",
      date: "2024-01-13",
      amount: "$1,899",
    },
  ];

  console.log("Recent bookings loaded:", bookings);
}

function displayActivityLog() {
  const activityList = document.querySelector(
    '[data-section="dashboard"] .activity-list',
  );
  if (!activityList) return;

  // Mock activity data
  const activities = [
    {
      icon: "success",
      type: "New booking received from John Smith for Caribbean Island Escape",
      time: "2 hours ago",
    },
    {
      icon: "info",
      type: "Payment received for booking #BK002 - $1,599.00",
      time: "4 hours ago",
    },
    {
      icon: "success",
      type: "New user registration from emily@example.com",
      time: "6 hours ago",
    },
    {
      icon: "info",
      type: "Contact form submission from Michael Johnson",
      time: "1 day ago",
    },
  ];

  console.log("Activity log updated:", activities);
}

// Action Buttons Setup
function setupActionButtons() {
  // Edit buttons
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-edit")) {
      handleEdit(e.target.closest(".btn-edit"));
    }
    if (e.target.closest(".btn-delete")) {
      handleDelete(e.target.closest(".btn-delete"));
    }
    if (e.target.closest(".btn-save")) {
      handleSave(e.target.closest(".btn-save"));
    }
  });
}

function handleEdit(button) {
  const row = button.closest("tr");
  if (row) {
    alert(
      "Edit functionality would open a modal or form for editing this item.",
    );
  }
}

function handleDelete(button) {
  if (
    confirm(
      "Are you sure you want to delete this item? This action cannot be undone.",
    )
  ) {
    const row = button.closest("tr");
    if (row) {
      row.style.opacity = "0.5";
      setTimeout(() => {
        row.remove();
        alert("Item deleted successfully!");
      }, 300);
    }
  }
}

function handleSave(button) {
  alert("Changes saved successfully!");
}

// Filter Buttons
function setupFilterButtons() {
  const bookingFilter = document.getElementById("booking-filter");
  const messageFilter = document.getElementById("message-filter");

  if (bookingFilter) {
    bookingFilter.addEventListener("change", function () {
      filterBookings(this.value);
    });
  }

  if (messageFilter) {
    messageFilter.addEventListener("change", function () {
      filterMessages(this.value);
    });
  }
}

function filterBookings(status) {
  const bookingRows = document.querySelectorAll("#bookings-table tbody tr");

  bookingRows.forEach((row) => {
    if (status === "all") {
      row.style.display = "table-row";
    } else {
      const rowStatus = row
        .querySelector("td:nth-child(6)")
        .textContent.toLowerCase();
      if (rowStatus.includes(status.toLowerCase())) {
        row.style.display = "table-row";
      } else {
        row.style.display = "none";
      }
    }
  });
}

function filterMessages(type) {
  const messages = document.querySelectorAll(".message-item");

  messages.forEach((msg) => {
    if (type === "all") {
      msg.style.display = "block";
    } else if (type === "unread" && msg.classList.contains("unread")) {
      msg.style.display = "block";
    } else if (type === "read" && msg.classList.contains("read")) {
      msg.style.display = "block";
    } else {
      msg.style.display = "none";
    }
  });
}

// Settings Form
function setupSettingsForm() {
  const settingsBtn = document.querySelector(
    '[data-section="settings"] .btn-primary',
  );

  if (settingsBtn) {
    settingsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      saveSettings();
    });
  }

  // Add event listeners to all form control inputs in settings
  const formControls = document.querySelectorAll(
    '[data-section="settings"] .form-control',
  );
  formControls.forEach((control) => {
    control.addEventListener("change", function () {
      console.log(`${this.previousElementSibling.textContent}: ${this.value}`);
    });
  });
}

function saveSettings() {
  const settings = {
    company:
      document.querySelector('input[placeholder="Enter company name"]')
        ?.value || "",
    email:
      document.querySelector('input[placeholder="Enter email address"]')
        ?.value || "",
    phone:
      document.querySelector('input[placeholder="Enter phone number"]')
        ?.value || "",
    currency: document.querySelector("select")?.value || "USD",
    timezone: document.querySelectorAll("select")[1]?.value || "UTC",
  };

  // Save to localStorage
  localStorage.setItem("adminSettings", JSON.stringify(settings));
  alert("Settings saved successfully!");
  console.log("Settings saved:", settings);
}

function setupContentManagement() {
  loadContentPermissions();
  loadHomepageContentFields();

  const permissionsBtn = document.getElementById("save-permissions-btn");
  if (permissionsBtn) {
    permissionsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      saveContentPermissions();
    });
  }

  const contentBtn = document.getElementById("save-content-btn");
  if (contentBtn) {
    contentBtn.addEventListener("click", function (e) {
      e.preventDefault();
      saveHomepageContent();
    });
  }
}

function getContentPermissions() {
  const raw = localStorage.getItem(ADMIN_CONTENT_PERMISSIONS_KEY);
  if (!raw) return { ...defaultContentPermissions };

  try {
    return { ...defaultContentPermissions, ...JSON.parse(raw) };
  } catch (error) {
    console.error("Failed to parse content permissions:", error);
    return { ...defaultContentPermissions };
  }
}

function loadContentPermissions() {
  const permissions = getContentPermissions();

  const imageToggle = document.getElementById("perm-change-image");
  const titleToggle = document.getElementById("perm-change-title");
  const paragraphToggle = document.getElementById("perm-change-paragraph");
  const otherToggle = document.getElementById("perm-change-other");

  if (imageToggle) imageToggle.checked = permissions.canChangeImage;
  if (titleToggle) titleToggle.checked = permissions.canChangeTitle;
  if (paragraphToggle) paragraphToggle.checked = permissions.canChangeParagraph;
  if (otherToggle) otherToggle.checked = permissions.canChangeOther;
}

function saveContentPermissions() {
  const permissions = {
    canChangeImage: document.getElementById("perm-change-image")?.checked ?? true,
    canChangeTitle: document.getElementById("perm-change-title")?.checked ?? true,
    canChangeParagraph:
      document.getElementById("perm-change-paragraph")?.checked ?? true,
    canChangeOther: document.getElementById("perm-change-other")?.checked ?? true,
  };

  localStorage.setItem(ADMIN_CONTENT_PERMISSIONS_KEY, JSON.stringify(permissions));
  alert("Content permissions saved successfully!");
}

function loadHomepageContentFields() {
  const raw = localStorage.getItem(SITE_CONTENT_OVERRIDES_KEY);
  if (!raw) return;

  try {
    const content = JSON.parse(raw);

    const browserTitleField = document.getElementById("content-browser-title");
    const heroTitleField = document.getElementById("content-hero-title");
    const heroParagraphField = document.getElementById("content-hero-paragraph");
    const heroCtaField = document.getElementById("content-hero-cta");
    const heroImageField = document.getElementById("content-hero-image");

    if (browserTitleField) browserTitleField.value = content.browserTitle || "";
    if (heroTitleField) heroTitleField.value = content.heroTitle || "";
    if (heroParagraphField) heroParagraphField.value = content.heroSubtitle || "";
    if (heroCtaField) heroCtaField.value = content.ctaText || "";
    if (heroImageField) heroImageField.value = content.heroImageUrl || "";
  } catch (error) {
    console.error("Failed to parse homepage content overrides:", error);
  }
}

function saveHomepageContent() {
  const permissions = getContentPermissions();
  const currentRaw = localStorage.getItem(SITE_CONTENT_OVERRIDES_KEY);
  let currentContent = {};

  if (currentRaw) {
    try {
      currentContent = JSON.parse(currentRaw);
    } catch (error) {
      console.error("Failed to parse existing homepage content:", error);
    }
  }

  const nextContent = { ...currentContent };

  if (permissions.canChangeOther) {
    nextContent.browserTitle =
      document.getElementById("content-browser-title")?.value.trim() || "";
    nextContent.ctaText =
      document.getElementById("content-hero-cta")?.value.trim() || "";
  }

  if (permissions.canChangeTitle) {
    nextContent.heroTitle =
      document.getElementById("content-hero-title")?.value.trim() || "";
  }

  if (permissions.canChangeParagraph) {
    nextContent.heroSubtitle =
      document.getElementById("content-hero-paragraph")?.value.trim() || "";
  }

  if (permissions.canChangeImage) {
    nextContent.heroImageUrl =
      document.getElementById("content-hero-image")?.value.trim() || "";
  }

  nextContent.updatedAt = new Date().toISOString();

  localStorage.setItem(SITE_CONTENT_OVERRIDES_KEY, JSON.stringify(nextContent));

  const blockedFields = [];
  if (!permissions.canChangeImage) blockedFields.push("picture");
  if (!permissions.canChangeTitle) blockedFields.push("title");
  if (!permissions.canChangeParagraph) blockedFields.push("paragraph");
  if (!permissions.canChangeOther) blockedFields.push("other content");

  if (blockedFields.length > 0) {
    alert(
      `Homepage content saved. Some fields were not changed because permission is disabled: ${blockedFields.join(", ")}.`,
    );
  } else {
    alert("Homepage content saved successfully!");
  }
}

// Message Actions
function setupMessageActions() {
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("message-action-btn")) {
      const action = e.target.getAttribute("data-action");
      const messageItem = e.target.closest(".message-item");

      handleMessageAction(action, messageItem);
    }
  });
}

function handleMessageAction(action, messageItem) {
  switch (action) {
    case "reply":
      alert("Reply functionality would open a compose form.");
      break;
    case "read":
      messageItem.classList.toggle("read");
      messageItem.classList.toggle("unread");
      alert("Message marked as read!");
      break;
    case "archive":
      messageItem.style.opacity = "0.5";
      setTimeout(() => {
        messageItem.remove();
        alert("Message archived!");
      }, 300);
      break;
    case "delete":
      if (confirm("Delete this message?")) {
        messageItem.style.opacity = "0.5";
        setTimeout(() => {
          messageItem.remove();
          alert("Message deleted!");
        }, 300);
      }
      break;
  }
}

setupMessageActions();

// Mock Data Management Functions
const dataManager = {
  packages: [
    {
      id: 1,
      name: "Caribbean Island Escape",
      duration: "7 days",
      price: "$1,299",
      category: "Beach",
      status: "Active",
    },
    {
      id: 2,
      name: "Alpine Peak Trek",
      duration: "10 days",
      price: "$1,599",
      category: "Adventure",
      status: "Active",
    },
    {
      id: 3,
      name: "Ancient Civilizations Tour",
      duration: "12 days",
      price: "$1,899",
      category: "Culture",
      status: "Active",
    },
  ],

  destinations: [
    { id: 1, name: "Bali", description: "Beautiful island paradise" },
    { id: 2, name: "Paris", description: "City of lights and romance" },
    { id: 3, name: "Tokyo", description: "Modern meets traditional" },
    { id: 4, name: "Swiss Alps", description: "Mountain peaks and valleys" },
  ],

  bookings: [
    {
      id: "BK001",
      customer: "Sarah Johnson",
      package: "Caribbean Island Escape",
      date: "2024-01-15",
      amount: "$1,299",
      status: "Confirmed",
    },
    {
      id: "BK002",
      customer: "Mike Wilson",
      package: "Alpine Peak Trek",
      date: "2024-01-14",
      amount: "$1,599",
      status: "Pending",
    },
    {
      id: "BK003",
      customer: "Emily Brown",
      package: "Ancient Civilizations",
      date: "2024-01-13",
      amount: "$1,899",
      status: "Confirmed",
    },
  ],

  // CRUD Operations
  addPackage(pkg) {
    this.packages.push({ id: this.packages.length + 1, ...pkg });
    console.log("Package added:", pkg);
  },

  updatePackage(id, updatedData) {
    const pkg = this.packages.find((p) => p.id === id);
    if (pkg) {
      Object.assign(pkg, updatedData);
      console.log("Package updated:", pkg);
    }
  },

  deletePackage(id) {
    const index = this.packages.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.packages.splice(index, 1);
      console.log("Package deleted, id:", id);
    }
  },

  getPackages() {
    return this.packages;
  },
};

// Export for use in other scripts if needed
window.AdminApp = {
  logout,
  showSection,
  dataManager,
  saveSettings,
};
