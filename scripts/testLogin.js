import axios from 'axios';

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@fleetek.com',
            password: 'admin123'
        });
        console.log('Login Success!');
        console.log('Token:', response.data.token);
    } catch (error) {
        console.error('Login Failed:', error.response?.status, error.response?.data);
    }
};

testLogin();
