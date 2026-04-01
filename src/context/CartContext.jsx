import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("zafair_cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from local storage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("zafair_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to local storage", error);
    }
  }, [cartItems]);

  const addToCart = (product, variant = null, quantity = 1) => {
    setCartItems((prevItems) => {
      // Create a unique ID for the item based on product ID and variant name
      const variantName = variant ? (typeof variant === 'object' ? variant.name : variant) : null;

      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedVariant === variantName
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // New item
        return [
          ...prevItems,
          {
            ...product,
            selectedVariant: variantName,
            selectedVariantFull: variant, // Store full variant object if needed
            quantity: quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, variant = null) => {
    const variantName = variant ? (typeof variant === 'object' ? variant.name : variant) : null;
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.selectedVariant === variantName)
      )
    );
  };

  const updateQuantity = (productId, variant = null, amount) => {
    const variantName = variant ? (typeof variant === 'object' ? variant.name : variant) : null;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId && item.selectedVariant === variantName) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
