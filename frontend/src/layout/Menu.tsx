import { Menu, MenuItemLink, usePermissions } from 'react-admin';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export const AppMenu = () => {
  const { permissions } = usePermissions();
  const canSeeCatalog = permissions?.includes('ROLE_ADMIN') || permissions?.includes('ROLE_CASHIER') || permissions?.includes('ROLE_RECEPTIONIST');

  return (
    <Menu>
      {canSeeCatalog && (
        <>
          <MenuItemLink to="/membership-plans" primaryText="Membership Plans" leftIcon={<ListAltIcon />} />
          <MenuItemLink to="/plan-prices" primaryText="Plan Prices" leftIcon={<MonetizationOnIcon />} />
        </>
      )}
    </Menu>
  );
};
