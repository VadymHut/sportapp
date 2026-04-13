import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import { dataProvider } from './core/dataProvider';
import { authProvider } from './core/authProvider';
import { theme } from './theme';
import { AppLayout } from './layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import LoginPage from './auth/LoginPage';
import CustomNotification from './layout/CustomNotification';

import { PlanList, PlanCreate, PlanEdit, PlanShow } from './resources/membershipPlans';
import { PriceList, PriceCreate, PriceEdit, PriceShow } from './resources/planPrices';
import { ClientList, ClientCreate, ClientEdit, ClientShow } from './resources/clients';
import { TrainerList, TrainerCreate, TrainerEdit, TrainerShow } from './resources/trainers';
import { StaffList, StaffCreate, StaffEdit, StaffShow } from './resources/staff';
import { AppUserList, AppUserCreate, AppUserEdit, AppUserShow } from './resources/appUsers';
import { MembershipList, MembershipCreate, MembershipEdit, MembershipShow } from './resources/memberships';
import { CheckInList, CheckInCreate, CheckInEdit, CheckInShow } from './resources/check-ins';

import ChangePassword from './pages/ChangePassword';
import MembershipQuickView from './pages/MembershipQuickView';
import QuickCheckIn from './pages/QuickCheckIn';
import QuickPersonCreate from './pages/QuickPersonCreate';
import MembershipPriceSummary from './pages/MembershipPriceSummary';
import ClientInfo from './pages/ClientInfo';
import TrainerInfoPage from './pages/TrainerInfo';
import PriceBoard from './pages/PriceBoard';
import ImportDataPage from './pages/ImportDataPage';

import ListAltIcon from '@mui/icons-material/ListAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BadgeIcon from '@mui/icons-material/Badge';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import HowToRegIcon from '@mui/icons-material/HowToReg';




export default function App() {

  return (
    <>
      <CssBaseline />
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        theme={theme}
        layout={AppLayout}
        dashboard={Dashboard}
        loginPage={LoginPage}
        notification={CustomNotification}
      >
        <CustomRoutes>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/memberships/:id/quick" element={<MembershipQuickView />} />
          <Route path="/quick-checkin" element={<QuickCheckIn />} />
          <Route path="/quick-person" element={<QuickPersonCreate />} />
          <Route path="/memberships/:id/price" element={<MembershipPriceSummary />} />
          <Route path="/client-info" element={<ClientInfo />} />
          <Route path="/trainer-info" element={<TrainerInfoPage />} />
          <Route path="/price-board" element={<PriceBoard />} />
          <Route path="/import-data" element={<ImportDataPage />} />
        </CustomRoutes>

        <Resource
          name="membership-plans"
          list={PlanList}
          create={PlanCreate}
          edit={PlanEdit}
          show={PlanShow}
          icon={ListAltIcon}
          recordRepresentation={(rec: any) =>
            rec
              ? `${rec.activityType} / ${rec.groupType} / ${rec.frequencyType}`
              : 'Plan'
          }
        />

        <Resource
          name="plan-prices"
          list={PriceList}
          create={PriceCreate}
          edit={PriceEdit}
          show={PriceShow}
          icon={MonetizationOnIcon}
        />

        <Resource
          name="clients"
          list={ClientList}
          create={ClientCreate}
          edit={ClientEdit}
          show={ClientShow}
          icon={PeopleIcon}
        />

        <Resource
          name="trainers"
          list={TrainerList}
          create={TrainerCreate}
          edit={TrainerEdit}
          show={TrainerShow}
          icon={FitnessCenterIcon}
        />

        <Resource
          name="staff"
          list={StaffList}
          create={StaffCreate}
          edit={StaffEdit}
          show={StaffShow}
          icon={BadgeIcon}
          options={{ label: 'Staff' }}
        />

        <Resource
          name="app-users"
          list={AppUserList}
          create={AppUserCreate}
          edit={AppUserEdit}
          show={AppUserShow}
          icon={ManageAccountsIcon}
          options={{ label: 'Users' }}
          recordRepresentation={(rec: any) => rec?.login ?? 'User'}
        />

        <Resource
          name="memberships"
          list={MembershipList}
          create={MembershipCreate}
          edit={MembershipEdit}
          show={MembershipShow}
          icon={CardMembershipIcon}
          recordRepresentation={(rec: any) =>
            rec ? `Membership #${rec.id}` : 'Membership'
          }
        />

        <Resource
          name="checkins"
          list={CheckInList}
          create={CheckInCreate}
          edit={CheckInEdit}
          show={CheckInShow}
          icon={HowToRegIcon}
          recordRepresentation={(rec: any) =>
            rec ? `Check-In #${rec.id}` : 'Check-In'
          }
        />
      </Admin>
    </>
  );
}
