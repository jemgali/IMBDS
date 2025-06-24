import UserManage from "../components/UserManage";
import Layout from "../components/Layout";
import Table from "../components/Table";

export default function UserPage() {
  return (
    <Layout>
      <UserManage>
        <Table/>
      </UserManage>
    </Layout>
  );
}