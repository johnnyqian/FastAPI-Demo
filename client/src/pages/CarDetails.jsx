import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchCarById, clearCurrentCar } from '../features/cars/carsSlice';
import { selectCurrentCar, selectCarsStatus, selectCarsError } from '../features/cars/carsSlice';

function CarDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const car = useSelector(selectCurrentCar);
  const status = useSelector(selectCarsStatus);
  const error = useSelector(selectCarsError);

  // 加载汽车详情
  useEffect(() => {
    if (id) {
      dispatch(fetchCarById(parseInt(id)));
    }

    // 清理函数
    return () => {
      dispatch(clearCurrentCar());
    };
  }, [id, dispatch]);

  // 渲染加载状态
  if (status === 'loading') {
    return <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      <span className="ml-3 text-lg">加载中...</span>
    </div>;
  }

  // 渲染错误状态
  if (status === 'failed') {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      错误：{error}
    </div>;
  }

  // 渲染汽车不存在状态
  if (!car) {
    return <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">汽车不存在</h3>
      <p className="mt-1 text-sm text-gray-500">请检查汽车ID是否正确</p>
      <div className="mt-6">
        <Link 
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          返回汽车列表
        </Link>
      </div>
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">汽车详情</h1>
          <p className="text-gray-500 mt-1">ID: {car.id}</p>
        </div>
        <div className="flex space-x-4">
          <Link 
            to={`/cars/${car.id}/edit`}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            编辑汽车
          </Link>
          <Link 
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回列表
          </Link>
        </div>
      </div>

      {/* 汽车基本信息 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">基本信息</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">型号:</span>
                <span className="font-medium">{car.model || '未命名'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">尺寸:</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {car.size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">车门数量:</span>
                <span className="font-medium">{car.doors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">燃料类型:</span>
                <span className="font-medium">{car.fuel || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">变速箱:</span>
                <span className="font-medium">{car.transmission || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">行程统计</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">总行程次数:</span>
                <span className="font-medium">{car.trips.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总行驶距离:</span>
                <span className="font-medium">
                  {car.trips.reduce((total, trip) => total + (trip.end - trip.start), 0)} 公里
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均行程距离:</span>
                <span className="font-medium">
                  {car.trips.length > 0 ? Math.round(car.trips.reduce((total, trip) => total + (trip.end - trip.start), 0) / car.trips.length) : 0} 公里
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 行程记录 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">行程记录</h2>
          <Link 
            to={`/cars/${car.id}/trips/add`}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            添加行程
          </Link>
        </div>

        {car.trips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始里程</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束里程</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">距离</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {car.trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{trip.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{trip.start} 公里</td>
                    <td className="px-6 py-4 whitespace-nowrap">{trip.end} 公里</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {trip.end - trip.start} 公里
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.description || '无描述'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/trips/${trip.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        编辑
                      </Link>
                      <button 
                        onClick={() => {
                          // 这里需要实现删除行程的功能
                          if (window.confirm('确定要删除这个行程吗？')) {
                            // dispatch(deleteTrip(trip.id));
                            alert('删除行程功能需要后端API支持');
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有行程记录</h3>
            <p className="mt-1 text-sm text-gray-500">为这辆汽车添加第一个行程吧</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarDetails;
