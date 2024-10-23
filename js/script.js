const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYsQ7zDzMXVCamImCYcEkIVXhD15NuWc1QMpJUc919xT28ZupaPYlAxsXZpbX1f5OEzh6EM48v4SYc/pub?output=csv";

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
    setupDarkMode();
    setupSearch();
});

function createCard(data) {
    const description = data.deskripsi ? `<div class="portfolio-description">${escapeHtml(data.deskripsi)}</div>` : "";

    return `
        <div class="portfolio-card">
            <div class="portfolio-content">
                <h3 class="portfolio-title">
                    <span class="user-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.06 2.09-2.52 6-2.52 3.9 0 5.97 1.42 6 2.52-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                    </span>
                    ${escapeHtml(data.nama)}
                </h3>
                <p class="portfolio-details">NIM: ${escapeHtml(data.nim)}</p>
                ${description}
            </div>
            <a href="${escapeHtml(data.link)}" class="portfolio-link" target="_blank">Lihat Portofolio</a>
        </div>
    `;
}

function displayPortfolio(data) {
    const portfolioContainer = document.getElementById("portfolioContainer");
    
    if (!data || data.length === 0) {
        portfolioContainer.innerHTML = `
            <div class="error-message">
                <h3>Tidak ada data untuk ditampilkan</h3>
                <p>Pastikan Google Sheets sudah dipublish ke web dan URL CSV sudah benar.</p>
            </div>`;
        return;
    }

    portfolioContainer.innerHTML = "";
    data.forEach((item) => {
        if (item.nama && item.nim && item.link) {
            const cardHTML = createCard(item);
            portfolioContainer.innerHTML += cardHTML;
        }
    });

    updateStats(data.length);
}

function updateStats(total) {
    document.getElementById("totalSubmissions").textContent = total;
    const completionRate = Math.round((total / 33) * 100);
    document.getElementById("completionRate").textContent = `${completionRate}%`;
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function fetchData() {
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        transformHeader: function(header) {
            return header.toLowerCase().trim();
        },
        complete: function (results) {
            console.log("Data mentah:", results.data);
            const validData = results.data.filter(item => item.nama && item.nim && item.link);
            console.log("Data valid:", validData);
            displayPortfolio(validData);
        },
        error: function (error) {
            console.error("Error mengambil data CSV:", error);
            document.getElementById("portfolioContainer").innerHTML = `
                <div class="error-message">
                    <h3>Error mengambil data</h3>
                    <p>Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.</p>
                    <p>Detail error: ${error.message}</p>
                </div>`;
        }
    });
}

function setupDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (prefersDark) {
        document.body.classList.add("dark-mode");
        darkModeToggle.textContent = "🌞";
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌜";
    });
}

function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const portfolioCards = document.querySelectorAll(".portfolio-card");
        
        portfolioCards.forEach((card) => {
            const title = card.querySelector(".portfolio-title").textContent.toLowerCase();
            const nim = card.querySelector(".portfolio-details").textContent.toLowerCase();
            if (title.includes(searchTerm) || nim.includes(searchTerm)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}