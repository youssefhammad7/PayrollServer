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
  alpha,
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
        <ListItem disablePadding sx={{ pl: isSubItem ? 3 : 0, mb: 0.5 }}>
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
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: '60%',
                  bgcolor: 'primary.contrastText',
                  borderRadius: '0 2px 2px 0',
                },
              },
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1 : 2,
              py: 1.5,
              borderRadius: 2,
              margin: '2px 8px',
              position: 'relative',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: alpha('#1E88E5', 0.08),
                transform: collapsed ? 'scale(1.1)' : 'translateX(8px)',
                boxShadow: '0 4px 12px rgba(30,136,229,0.15)',
              },
              '&:active': {
                transform: collapsed ? 'scale(0.95)' : 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive && !hasSubItems ? 'inherit' : alpha('#1E88E5', 0.7),
                minWidth: collapsed ? 'auto' : 40,
                justifyContent: 'center',
                transition: 'all 0.2s ease-in-out',
                '& .MuiSvgIcon-root': {
                  fontSize: collapsed ? '1.4rem' : '1.2rem',
                },
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: isSubItem ? '0.875rem' : '0.95rem',
                    fontWeight: isActive && !hasSubItems ? 600 : 500,
                    color: isActive && !hasSubItems ? 'inherit' : 'text.primary',
                  }}
                />
                {hasSubItems && (
                  <Box sx={{
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: alpha('#1E88E5', 0.1),
                    color: 'primary.main',
                    ml: 1,
                  }}>
                    {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </Box>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasSubItems && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              ml: 2, 
              pl: 2, 
              borderLeft: '2px solid', 
              borderColor: alpha('#1E88E5', 0.1),
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -1,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'linear-gradient(180deg, transparent, rgba(30,136,229,0.3), transparent)',
              },
            }}>
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
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: 'linear-gradient(135deg, #1E88E5 0%, #1976D2 100%)',
            color: 'white',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }
          }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'inherit',
              width: 48,
              height: 48,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
            }}>
              💼
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Payroll System
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                opacity: 0.9 
              }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4CAF50',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Online • v1.0.0
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* User Info */}
          <Box sx={{ 
            p: 3, 
            bgcolor: alpha('#1E88E5', 0.04),
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(30,136,229,0.2), transparent)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(30,136,229,0.3)',
                border: '2px solid',
                borderColor: 'background.paper',
              }}>
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" noWrap>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={user?.roles[0]} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: alpha('#1E88E5', 0.08),
                  borderColor: alpha('#1E88E5', 0.3),
                }}
              />
              <Chip 
                label="Active" 
                size="small" 
                color="success" 
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: alpha('#4CAF50', 0.08),
                  borderColor: alpha('#4CAF50', 0.3),
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: alpha('#1E88E5', 0.1) }} />
        </>
      )}

      {collapsed && (
        <>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E88E5 0%, #1976D2 100%)',
          }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 48, 
              height: 48,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              color: 'white',
            }}>
              💼
            </Avatar>
          </Box>
          <Divider />
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'center',
            bgcolor: alpha('#1E88E5', 0.04),
          }}>
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(30,136,229,0.3)',
              border: '2px solid',
              borderColor: 'background.paper',
            }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </Box>
          <Divider sx={{ borderColor: alpha('#1E88E5', 0.1) }} />
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
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      mx: 1,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha('#1E88E5', 0.04),
                      border: '1px solid',
                      borderColor: alpha('#1E88E5', 0.08),
                      '&:hover': {
                        bgcolor: alpha('#1E88E5', 0.08),
                        borderColor: alpha('#1E88E5', 0.16),
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'primary.main',
                        letterSpacing: '0.5px',
                      }}
                    />
                    <Box sx={{ 
                      ml: 1,
                      p: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha('#1E88E5', 0.1),
                      color: 'primary.main',
                    }}>
                      {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </Box>
                  </ListItemButton>
                </ListItem>
              )}

              <Collapse in={!collapsed ? isExpanded : true} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ px: 1, pb: 2 }}>
                  {accessibleItems.map(item => renderMenuItem(item))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </Box>

      {/* Settings */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ borderColor: alpha('#1E88E5', 0.1), mb: 1 }} />
        <List sx={{ pb: 2 }}>
          <ListItem disablePadding sx={{ px: 1 }}>
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
                py: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: alpha('#1E88E5', 0.08),
                  transform: collapsed ? 'scale(1.1)' : 'translateX(8px)',
                  boxShadow: '0 4px 12px rgba(30,136,229,0.15)',
                },
                '&:active': {
                  transform: collapsed ? 'scale(0.95)' : 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: collapsed ? 'auto' : 40, 
                justifyContent: 'center',
                color: alpha('#1E88E5', 0.7),
                transition: 'all 0.2s ease-in-out',
                '& .MuiSvgIcon-root': {
                  fontSize: collapsed ? '1.4rem' : '1.2rem',
                },
              }}>
                <Settings />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary="Settings" 
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.95rem',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
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