import {DrawerComponent} from './components/Drawer'

export const Layout = ({ children }) => {
  return (
    <>
      <DrawerComponent />
      <main>{children}</main>
    </>
  );
};
