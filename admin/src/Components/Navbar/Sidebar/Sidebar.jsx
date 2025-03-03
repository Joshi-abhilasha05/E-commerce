import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <Link to="/addproduct">
                <div className="sidebar-item">
                    <img src="/Product_Cart.svg" alt="Product Cart" />
                    <p>Add Product</p>
                </div>
            </Link>
            <Link to="/listproduct">
                <div className="sidebar-item">
                    <img src="/Product_list_icon.svg" alt="Product Cart" />
                    <p>Product List</p>
                </div>
            </Link>
        </div>
    );
};

export default Sidebar;
