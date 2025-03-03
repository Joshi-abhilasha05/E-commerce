import React, { useEffect, useState } from 'react';
import './Popular.css'
import Item from '../Item/Item';
const Popular = () => {
    const [popularProducts, setPopularProducts] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/popularinwomen')
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched data:", data);
                if (Array.isArray(data)) {
                    setPopularProducts(data);
                } else {
                    setPopularProducts([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching popular products:", error);
                setPopularProducts([]); // Prevent breaking map()
            });
    }, []);

    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popularProducts.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    );
};

export default Popular;
