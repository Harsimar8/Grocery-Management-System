import React, { createContext, useEffect, useState,useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({children}) =>{
    const [cart, setCart] = useState(() =>{
        try{
            const savedCart = localStorage.getItem('cart')
            return savedCart ? JSON.parse(savedCart) : []
        }
        catch{
            return []
        }
    })
    // IT WILL SAVE THE CART IN LOCALstorage  WITH ITEMID ELSE IT WILL BE EMPTY ARRAY

    //SYNC CART TO LOCALSTORAGE WHENEVER IT CHANGES
    useEffect(() =>{
        localStorage.setItem('cart',JSON.stringify(cart))

    },[cart]);

    //ADD AN ITEM TO CART OR INCREASE
    const addToCart = (item, quantity = 1) =>{
        setCart(prevCart =>{
            const existingItem = prevCart.find(ci => ci.id === item.id)
            if(existingItem) {
                return prevCart.map(ci =>
                    ci.id === item.id ? { ...ci, quantity : ci.quantity + quantity } : ci
                )
            }
            else{
                return [...prevCart, {...item,quantity}]
            }
        })
    }
     // REMOVE ITEM FROM CART
     const removeFromCart = itemId =>{
        setCart(prevCart => prevCart.filter(ci => ci.id !== itemId))

     }
     //UPDATE ITEM QUANTITY
     const updateQuantity = (itemId, newQuantity) =>{
        if(newQuantity < 1)return;
        setCart(prevCart => prevCart.map(ci => ci.id === itemId ? { ...ci, quantity: newQuantity} : ci))
     }

     //CLEAR CART
       const clearCart = () =>{
        setCart([])
       }

       //CALCULATE TOTAL COST 
       const getCartTotal = () =>{
        return  cart.reduce((total,ci)  => total + ci.price * ci.quantity,0);
       };

        // CALCULATE TOTALNUMBER OF ITEMS IN CART

        const cartCount = cart.reduce((count,ci) => count + ci.quantity,0);
       return(
            <CartContext.Provider value={{
                cart,
                cartCount,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal
            }}>
            {children}
            </CartContext.Provider>
        );
    };
    

//CUSTOM HOOK FOR CART CONTEXT 
export const useCart = () =>{
    const context = useContext(CartContext)
    if(!context){
        throw new Error("USECART MUST BE USED WITHIN A CARTPROVIDER")
    }
    return context;
};