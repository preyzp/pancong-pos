import { NewOrderScreen } from "@/components/order/new-order-screen";
import { MOCK_MENU } from "@/data/mock/menu";

export default function NewOrderPage() {
  return <NewOrderScreen menu={MOCK_MENU} />;
}
