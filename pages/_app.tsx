import { AppProps } from 'next/app';

import '../styles/global.css';
import Header from '../components/Header';
import Layout from '../components/Layout';

import { AuthProvider } from '../context/AuthContext';

function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <Layout>
                <Header />
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    );
}

export default App;