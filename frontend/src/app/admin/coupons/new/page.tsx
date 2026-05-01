import CouponForm, { EMPTY_FORM } from "../_components/CouponForm";

export default function NewCouponPage() {
  return <CouponForm title="New Coupon" initial={EMPTY_FORM} />;
}
