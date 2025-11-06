import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrips, deleteTrip, setTripFilters, setTripPage, setTripPageSize } from '../features/trips/tripsSlice';
import { selectAllTrips, selectTripsStatus, selectTripsError, selectTripsFilters, selectTripsPagination } from '../features/trips/tripsSlice';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

function TripsManagement() {
  const dispatch = useDispatch();
  const trips = useSelector(selectAllTrips);
  const status = useSelector(selectTripsStatus);
  const error = useSelector(selectTripsError);
  const filters = useSelector(selectTripsFilters);
  const pagination = useSelector(selectTripsPagination);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // 初始化加载行程列表
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTrips());
    }
  }, [status, dispatch]);

  // 应用过滤和排序
  const filteredTrips = trips.filter(trip => {
    // 搜索过滤
    const matchesSearch = !searchTerm || 
      (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trip.carModel && trip.carModel.toLowerCase().includes(searchTerm.toLowerCase()));

    // 其他过滤条件
    const matchesCarId = !filters.carId || trip.carId === filters.carId;

    return matchesSearch && matchesCarId;
  });

  // 排序
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 分页
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedTrips = sortedTrips.slice(startIndex, endIndex);

  // 处理搜索
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 处理过滤
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setTripFilters({ ...filters, [name]: value || undefined }));
  };

  // 处理排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 处理分页
  const handlePageChange = ({ selected }) => {
    dispatch(setTripPage(selected + 1));
  };

  // 处理每页大小变化
  const handlePageSizeChange = (e) => {
    dispatch(setTripPageSize(parseInt(e.target.value)));
  };

  // 处理删除行程
  const handleDeleteTrip = (tripId) => {
    if (window.confirm('确定要删除这个行程吗？')) {
      dispatch(deleteTrip(tripId));
    }
  };

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">行程管理</h1>
        <Link 
          to="/cars" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          查看汽车列表
        </Link>
      </div>

      {/* 搜索和过滤区域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input 
              type="text"
              placeholder="搜索行程..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">汽车ID</label>
            <input 
              type="number"
              name="carId"
              placeholder="输入汽车ID"
              value={filters.carId || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每页显示</label>
            <select 
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 行程列表表格 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('carId')}
              >
                汽车ID {sortBy === 'carId' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('carModel')}
              >
                汽车型号 {sortBy === 'carModel' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('start')}
              >
                开始里程 {sortBy === 'start' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('end')}
              >
                结束里程 {sortBy === 'end' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('distance')}
              >
                距离 {sortBy === 'distance' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTrips.map(trip => (
              <tr key={trip.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{trip.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/cars/${trip.carId}`} className="text-blue-600 hover:underline">
                    {trip.carId}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{trip.carModel || 'N/A'}</td>
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
                    onClick={() => handleDeleteTrip(trip.id)}
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

      {/* 分页 */}
      {sortedTrips.length > 0 && (
        <div className="mt-6">
          <ReactPaginate
            previousLabel={'上一页'}
            nextLabel={'下一页'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={Math.ceil(sortedTrips.length / pagination.pageSize)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName={'flex justify-center'} 
            activeClassName={'bg-blue-600 text-white'}
            pageClassName={'mx-1'}
            pageLinkClassName={'px-3 py-1 border rounded-md'}
            previousClassName={'mx-1'}
            previousLinkClassName={'px-3 py-1 border rounded-md'}
            nextClassName={'mx-1'}
            nextLinkClassName={'px-3 py-1 border rounded-md'}
            disabledClassName={'opacity-50 cursor-not-allowed'}
          />
        </div>
      )}

      {/* 空状态 */}
      {sortedTrips.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到行程</h3>
          <p className="mt-1 text-sm text-gray-500">请尝试调整搜索或过滤条件</p>
        </div>
      )}
    </div>
  );
}

export default TripsManagement;
