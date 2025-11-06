import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { selectAuthStatus, selectAuthError } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// 登录表单验证规则
const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required('用户名是必填项'),
  password: Yup.string()
    .required('密码是必填项')
    .min(6, '密码长度不能少于6个字符')
});

function Login() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  // 处理表单提交
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      await dispatch(login(values)).unwrap();
      // 登录成功后跳转到汽车列表页
      navigate('/');
    } catch (err) {
      setServerError('登录失败：用户名或密码错误');
      console.error('登录失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">登录到汽车共享服务</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或者{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              创建一个新账号
            </a>
          </p>
        </div>

        {/* 服务器错误信息 */}
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {serverError}
          </div>
        )}

        {/* 表单 */}
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="username" className="sr-only">用户名</label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="用户名"
                  />
                  <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1 ml-3" />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">密码</label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="密码"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1 ml-3" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    记住我
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    忘记密码？
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || status === 'loading'}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || status === 'loading' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      登录中...
                    </div>
                  ) : (
                    '登录'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
