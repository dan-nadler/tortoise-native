import React from 'react';
import { Link } from 'react-router-dom';

const Nav: React.FC<{ subtitle: string, path: string }> = ({ subtitle, path }) => {
    return (
        <nav className="pb-4">
            <div className="flex">
                <ul className="flex items-center space-x-2">
                    <li className="text-gray-600 text-xl hover:text-gray-400">
                        <Link to={"/"}>The Tortoise</Link>
                    </li>
                    {subtitle && <li className="text-gray-500 text-xl">/</li>}
                    <li className="text-gray-500 text-xl">
                        <div>{subtitle}</div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Nav;
