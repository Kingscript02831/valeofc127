
import React from 'react';
import Navbar2 from '../components/Navbar2';
import SubNav2 from '../components/SubNav2';
import { AdmProductStyles } from '../components/admin/AdmProduct';

const AdminProducts = () => {
  const styles = AdmProductStyles({ pageType: 'list' });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <main className={`container mx-auto px-4 py-8 ${styles.backgroundPrimary}`}>
        <div className={styles.cardBase}>
          <h1 className={`text-2xl font-bold mb-4 ${styles.textPrimary}`}>
            Gerenciar Produtos
          </h1>
          {/* Aqui virá o conteúdo da administração de produtos */}
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;
