class ShopPage {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.items = [
      {
        name: "Blue Profile Theme",
        cost: 30,
        icon: "🎨",
        description: "Customize your profile card color"
      },
      {
        name: "Gold Avatar Frame",
        cost: 50,
        icon: "🥇",
        description: "Add a golden border to your profile"
      },
      {
        name: "Special Title Badge",
        cost: 80,
        icon: "✨",
        description: "Add a special badge beside your title"
      },
      {
        name: "10% RP Food Voucher",
        cost: 250,
        icon: "🎟️",
        description: "Enjoy 10% off at participating RP food stalls."
      }
    ];
  }

  render(player) {
    this.container.innerHTML = `
      <div class="card">
        <h2>🛒 Reward Shop</h2>

        <div class="shop-list">
          ${this.items.map(item => {
            const owned = player.ownedItems.includes(item.name);

            return `
              <div class="shop-item">
                <div class="shop-left">
                  <div class="shop-icon">${item.icon}</div>
                  <div>
                    <strong>${item.name}</strong>
                    <p>${item.description}</p>
                  </div>
                </div>

                <div>
                  <strong>💰 ${item.cost}</strong>
                  <button 
                    class="buy-btn" 
                    data-item="${item.name}" 
                    data-cost="${item.cost}"
                    ${owned ? "disabled" : ""}
                  >
                    ${owned ? "Owned" : "Buy"}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }
}