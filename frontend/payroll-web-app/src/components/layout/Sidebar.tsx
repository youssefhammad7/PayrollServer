import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  AccountBalance,
  Assessment,
  Settings,
  Group,
  ExpandLess,
  ExpandMore,
  WorkOutline,
  Schedule,
  Calculate,
  Receipt,
  PersonAdd,
  Grade,
  AccessTime,
  RemoveCircle,
  Folder,
  BarChart,
  Description,
  PersonSearch,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  collapsed?: boolean;
  isMobile?: boolean;
  onClose: () => void;
  drawerWidth: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  adminOnly?: boolean;
  roles?: string[];
}

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  roles?: string[];
  subItems?: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  collapsed = false,
  isMobile = false,
  onClose, 
  drawerWidth 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isHRClerk } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['main']);

  const menuSections: MenuSection[] = [
    {
      title: 'Main',
      items: [
        {
          text: 'Dashboard',
          path: '/dashboard',
          icon: <Dashboard />,
        },
      ],
    },
    {
      title: 'User Management',
      adminOnly: true,
      items: [
        {
          text: 'Users',
          path: '/users',
          icon: <Group />,
          adminOnly: true,
        },
      ],
    },
    {
      title: 'Master Data',
      roles: ['Admin', 'HR Clerk'],
      items: [
        {
          text: 'Departments',
          path: '/departments',
          icon: <Business />,
          roles: ['Admin', 'HR Clerk'],
        },
        {
          text: 'Job Grades',
          path: '/job-grades',
          icon: <Grade />,
          roles: ['Admin', 'HR Clerk'],
        },
        {
          text: 'Service Brackets',
          path: '/service-brackets',
          icon: <WorkOutline />,
          roles: ['Admin', 'HR Clerk'],
        },
        {
          text: 'Absence Thresholds',
          path: '/absence-thresholds',
          icon: <RemoveCircle />,
          roles: ['Admin', 'HR Clerk'],
        },
      ],
    },
    {
      title: 'Employee Management',
      items: [
        {
          text: 'Employees',
          path: '/employees',
          icon: <People />,
          subItems: [
            {
              text: 'Employee List',
              path: '/employees',
              icon: <People />,
            },
            {
              text: 'Add Employee',
              path: '/employees/create',
              icon: <PersonAdd />,
              roles: ['Admin', 'HR Clerk'],
            },
          ],
        },
      ],
    },
    {
      title: 'Salary Management',
      roles: ['Admin', 'HR Clerk'],
      items: [
        {
          text: 'Salary Records',
          path: '/salary-records',
          icon: <AccountBalance />,
          roles: ['Admin', 'HR Clerk'],
        },
      ],
    },
    {
      title: 'Attendance',
      items: [
        {
          text: 'Absence Records',
          path: '/absence-records',
          icon: <Schedule />,
          roles: ['Admin', 'HR Clerk'],
        },
      ],
    },
    {
      title: 'Payroll Operations',
      roles: ['Admin', 'HR Clerk'],
      items: [
        {
          text: 'Payroll Calculation',
          path: '/payroll/calculate',
          icon: <Calculate />,
          roles: ['Admin', 'HR Clerk'],
        },
        {
          text: 'Payroll Review',
          path: '/payroll/review',
          icon: <Receipt />,
          roles: ['Admin', 'HR Clerk'],
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        {
          text: 'Reports',
          path: '/reports',
          icon: <Assessment />,
          subItems: [
            {
              text: 'Attendance Reports',
              path: '/reports/attendance',
              icon: <AccessTime />,
            },
            {
              text: 'Salary Reports',
              path: '/reports/salary',
              icon: <AccountBalance />,
            },
            {
              text: 'Incentives Reports',
              path: '/reports/incentives',
              icon: <BarChart />,
            },
            {
              text: 'Employee Directory',
              path: '/reports/directory',
              icon: <PersonSearch />,
            },
          ],
        },
      ],
    },
  ];

  const hasAccess = (item: MenuItem | MenuSection): boolean => {
    if (item.adminOnly && !isAdmin()) return false;
    if (item.roles && !item.roles.some(role => user?.roles.includes(role))) return false;
    return true;
  };

  const handleSectionToggle = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isItemActive = (path: string): boolean => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    if (!hasAccess(item)) return null;

    const isActive = isItemActive(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSections.includes(item.text);

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding sx={{ pl: isSubItem ? 4 : 0 }}>
          <ListItemButton
            selected={isActive && !hasSubItems}
            onClick={() => {
              if (hasSubItems) {
                if (!collapsed) {
                  handleSectionToggle(item.text);
                }
              } else {
                navigate(item.path);
                if (isMobile) {
                  onClose();
                }
              }
            }}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.main',
                },
              },
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive && !hasSubItems ? 'inherit' : 'action.active',
                minWidth: collapsed ? 'auto' : 40,
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: isSubItem ? '0.875rem' : '1rem',
                    fontWeight: isActive && !hasSubItems ? 'bold' : 'normal',
                  }}
                />
                {hasSubItems && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasSubItems && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems?.map(subItem => renderMenuItem(subItem, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {!collapsed && (
        <>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>💼</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" noWrap>
                Payroll System
              </Typography>
              <Typography variant="caption" color="text.secondary">
                v1.0.0
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* User Info */}
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={user?.roles[0]} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>

          <Divider />
        </>
      )}

      {collapsed && (
        <>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>💼</Avatar>
          </Box>
          <Divider />
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </Box>
          <Divider />
        </>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {menuSections.map(section => {
          if (!hasAccess(section)) return null;

          const accessibleItems = section.items.filter(hasAccess);
          if (accessibleItems.length === 0) return null;

          const isExpanded = expandedSections.includes(section.title);

          return (
            <React.Fragment key={section.title}>
              {!collapsed && (
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSectionToggle(section.title)}
                    sx={{ py: 1 }}
                  >
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                      }}
                    />
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
              )}

              <Collapse in={!collapsed ? isExpanded : true} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {accessibleItems.map(item => renderMenuItem(item))}
                </List>
              </Collapse>

              {!collapsed && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Settings */}
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => {
              navigate('/settings');
              if (isMobile) {
                onClose();
              }
            }}
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1 : 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
              <Settings />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Settings" />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}; 