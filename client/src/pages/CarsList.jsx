import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCars, deleteCars, setFilters, setPage, setPageSize } from '../features/cars/carsSlice';
import { selectAllCars, selectCarsStatus, selectCarsError, selectCarsFilters, selectCarsPagination } from '../features/cars/carsSlice';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

function CarsList() {
  const dispatch = useDispatch();
  const cars = useSelector(selectAllCars);
  const status = useSelector(selectCarsStatus);
  const error = useSelector(selectCarsError);
  const filters = useSelector(selectCarsFilters);
  const pagination = useSelector(selectCarsPagination);
  const [selectedCars, setSelectedCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // 初始化加载汽车列表
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCars());
    }
  }, [status, dispatch]);

  // 应用过滤和排序
  const filteredCars = cars.filter(car => {
    // 搜索过滤
    const matchesSearch = !searchTerm || 
      (car.model && car.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.fuel && car.fuel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.transmission && car.transmission.toLowerCase().includes(searchTerm.toLowerCase()));

    // 其他过滤条件
    const matchesSize = !filters.size || car.size === filters.size;
    const matchesDoors = !filters.doors || car.doors === filters.doors;

    return matchesSearch && matchesSize && matchesDoors;
  });

  // 排序
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 分页
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedCars = sortedCars.slice(startIndex, endIndex);

  // 处理搜索
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 处理过滤
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ ...filters, [name]: value || undefined }));
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
    dispatch(setPage(selected + 1));
  };

  // 处理每页大小变化
  const handlePageSizeChange = (e) => {
    dispatch(setPageSize(parseInt(e.target.value)));
  };

  // 处理汽车选择
  const handleCarSelect = (carId) => {
    setSelectedCars(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else {
        return [...prev, carId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedCars.length === paginatedCars.length) {
      setSelectedCars([]);
    } else {
      setSelectedCars(paginatedCars.map(car => car.id));
    }
  };

  // 处理批量删除
  const handleBulkDelete = () => {
    if (selectedCars.length > 0 && window.confirm('确定要删除选中的汽车吗？')) {
      dispatch(deleteCars(selectedCars));
      setSelectedCars([]);
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
        <h1 className="text-3xl font-bold text-gray-800">汽车列表</h1>
        <div className="flex space-x-4">
          <button 
            onClick={handleBulkDelete}
            disabled={selectedCars.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            批量删除 ({selectedCars.length})
          </button>
          <Link 
            to="/cars/add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            添加汽车
          </Link>
        </div>
      </div>

      {/* 搜索和过滤区域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input 
              type="text"
              placeholder="搜索汽车..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">尺寸</label>
            <select 
              name="size"
              value={filters.size || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有尺寸</option>
              <option value="s">小型 (S)</option>
              <option value="m">中型 (M)</option>
              <option value="l">大型 (L)</option>
              <option value="xl">超大型 (XL)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">车门数量</label>
            <select 
              name="doors"
              value={filters.doors || ''}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有车门</option>
              <option value="2">2门</option>
              <option value="4">4门</option>
              <option value="5">5门</option>
            </select>
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

      {/* 汽车列表表格 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox"
                  checked={selectedCars.length === paginatedCars.length && paginatedCars.length > 0}
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('model')}
              >
                型号 {sortBy === 'model' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('size')}
              >
                尺寸 {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('doors')}
              >
                车门 {sortBy === 'doors' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('fuel')}
              >
                燃料 {sortBy === 'fuel' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('transmission')}
              >
                变速箱 {sortBy === 'transmission' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCars.map(car => (
              <tr key={car.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox"
                    checked={selectedCars.includes(car.id)}
                    onChange={() => handleCarSelect(car.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{car.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/cars/${car.id}`} className="text-blue-600 hover:underline">
                    {car.model || '未命名'}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {car.size}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{car.doors}</td>
                <td className="px-6 py-4 whitespace-nowrap">{car.fuel || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{car.transmission || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    to={`/cars/${car.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    查看
                  </Link>
                  <Link 
                    to={`/cars/${car.id}/edit`}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    编辑
                  </Link>
                  <button 
                    onClick={() => {
                      if (window.confirm('确定要删除这辆汽车吗？')) {
                        dispatch(deleteCars([car.id]));
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

      {/* 分页 */}
      {sortedCars.length > 0 && (
        <div className="mt-6">
          <ReactPaginate
            previousLabel={'上一页'}
            nextLabel={'下一页'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={Math.ceil(sortedCars.length / pagination.pageSize)}
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
      {sortedCars.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到汽车</h3>
          <p className="mt-1 text-sm text-gray-500">请尝试调整搜索或过滤条件</p>
        </div>
      )}
    </div>
  );
}

export default CarsList;
