import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import {
  PersonAdd,
  Search,
  Edit,
  Delete,
  RestoreFromTrash,
  Security,
  Email,
  Phone,
  MoreVert,
  Verified,
  Block,
} from '@mui/icons-material';
import { userService } from '../services/api/userService';
import type { User, UserFilterParams } from '../types/user';
import { SYSTEM_ROLES } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Check authorization
  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access user management. This feature is available to Admin users only.
        </Alert>
      </Box>
    );
  }

  // State
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 1,
    pageSize: 25,
    searchTerm: '',
    role: '',
    isActive: undefined,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });

  // Fetch roles for filter
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userService.getRoles(),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete user', { variant: 'error' });
    },
  });

  // Handle pagination
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setFilters(prev => ({
      ...prev,
      page: model.page + 1,
      pageSize: model.pageSize,
    }));
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: event.target.value,
      page: 1,
    }));
  };

  // Handle role filter
  const handleRoleChange = (role: string) => {
    setFilters(prev => ({
      ...prev,
      role: role === 'all' ? '' : role,
      page: 1,
    }));
  };

  // Handle status filter
  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      isActive: status === 'all' ? undefined : status === 'active',
      page: 1,
    }));
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  // Define grid columns
  const columns: GridColDef<User>[] = [
    {
      field: 'user',
      headerName: 'User',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {params.row.firstName[0]}{params.row.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {userService.getFullName(params.row)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{params.row.username}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
          {params.row.emailConfirmed && (
            <Verified sx={{ fontSize: 16, color: 'success.main' }} />
          )}
        </Box>
      ),
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value || 'N/A'}</Typography>
        </Box>
      ),
    },
    {
      field: 'roles',
      headerName: 'Roles',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.map((role: string) => (
            <Chip
              key={role}
              label={role}
              size="small"
              color={userService.getRoleColor(role)}
              variant="outlined"
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={userService.formatUserStatus(params.value)}
          size="small"
          color={params.value ? 'success' : 'error'}
          variant={params.value ? 'filled' : 'outlined'}
          icon={params.value ? <Verified /> : <Block />}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params: any) => {
        if (!params || !params.value) return 'N/A';
        return userService.formatUserDate(params.value);
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${params.row.id}/edit`)}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Roles">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${params.row.id}/roles`)}
            >
              <Security />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteUser(params.row)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading users: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users, roles, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/users/create')}
        >
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search & Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="Search Users"
            placeholder="Search by name, email, or username..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role || 'all'}
              label="Role"
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {Object.values(SYSTEM_ROLES).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
              label="Status"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Summary Statistics */}
      {usersResponse && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" color="primary.main">
                {usersResponse.totalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main">
                {usersResponse.items.filter(user => user.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="info.main">
                {usersResponse.items.filter(user => user.roles.includes('Admin')).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrators
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Data Grid */}
      <Paper sx={{ height: 600 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={usersResponse?.items || []}
            columns={columns}
            paginationModel={{
              page: (filters.page || 1) - 1,
              pageSize: filters.pageSize || 25,
            }}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 25, 50, 100]}
            rowCount={usersResponse?.totalCount || 0}
            paginationMode="server"
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        )}
      </Paper>

      {/* No users message */}
      {usersResponse?.items.length === 0 && !isLoading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {filters.searchTerm || filters.role || filters.isActive !== undefined
            ? 'No users found matching your search criteria.'
            : 'No users found. Click "Add User" to create the first user.'
          }
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete && userService.getFullName(userToDelete)}"? 
            This action will deactivate the user but preserve their data for audit purposes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteUser} 
            color="error" 
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 