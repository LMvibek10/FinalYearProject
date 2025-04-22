import React, { useState } from 'react';
import Sidebar from '../component/ad_sidebar';

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 