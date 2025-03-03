import React, { useState, useEffect } from 'react';
import './ListProduct.css';

const ListProduct = () => {

    const [allproducts, setAllProducts] = useState([]);

    // Fetch all products from the API
    const fetchInfo = async () => {
        await fetch('http://localhost:4000/allproducts')
            .then((res) => res.json())
            .then((data) => {
                setAllProducts(data);
            })
            .catch(err => console.error('Error fetching products:', err));
    }

    // Fetch products when the component mounts
    useEffect(() => {
        fetchInfo();
    }, [])
    const remove_product = async (id) => {
        await fetch('http://localhost:4000/removeproduct', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        })
        await fetchInfo();
    }
    return (
        <div className='list-product'>
            <h1>All Products List</h1>
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {/* Loop over the products */}
                {allproducts.map((product, index) => {
                    return <>
                        <div key={index} className="listproduct-format-main listproduct-format">
                            {/* Check if the product has an image URL */}
                            <img
                                src={product.image ? product.image : '/default_image.png'} // Fallback to a default image
                                alt={product.name}
                                className="listproduct-product-icon"
                            />
                            <p>{product.name}</p>
                            <p>${product.old_price}</p>
                            <p>${product.new_price}</p>
                            <p>{product.category}</p>
                            <img onClick={() => { remove_product(product.id) }}
                                className='listproduct-remove-icon' src="/cross_icon.png" alt="cross Icon"
                            />
                        </div>
                        <hr />
                    </>
                })}
            </div>
        </div>
    )
}

export default ListProduct;
