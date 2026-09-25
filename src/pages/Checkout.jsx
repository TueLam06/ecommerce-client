import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const fraunces = { fontFamily: "'Fraunces', serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function formatVND(n) {
    return n.toLocaleString("vi-VN") + "đ";
}

function Checkout() {
    const { cart, total, clearCart } = useCart();
    const { token } = useAuth();
    const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [orderResult, setOrderResult] = useState(null); // { orderId, total } khi thành công

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (error) setError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const body = {
            customer_name: formData.name,
            phone: formData.phone,
            address: formData.address,
            ...(!token && {
                cart: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
            }),
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đặt hàng thất bại");

            setOrderResult({ orderId: data.orderId, total: data.total });
            clearCart();
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    }

    // Màn hình xác nhận sau khi đặt hàng thành công
    if (orderResult) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-[#FAFAF8] px-6">
                <div className="text-center max-w-md">
                    <div className="w-14 h-14 rounded-full bg-[#2F5233] text-[#F5F3EE] flex items-center justify-center mx-auto mb-6 text-2xl">
                        ✓
                    </div>
                    <h1 style={fraunces} className="text-3xl text-[#1F2420] mb-3">
                        Đặt hàng thành công
                    </h1>
                    <p style={inter} className="text-[#6B6F63] mb-1">
                        Mã đơn hàng <span className="text-[#1F2420] font-medium">#{orderResult.orderId}</span>
                    </p>
                    <p style={inter} className="text-[#6B6F63] mb-8">
                        Tổng thanh toán: <span className="text-[#1F2420] font-medium">{formatVND(orderResult.total)}</span>
                    </p>
                    <p style={inter} className="text-[#6B6F63] text-sm mb-8">
                        Chúng tôi sẽ liên hệ qua số điện thoại bạn đã cung cấp để xác nhận đơn.
                    </p>
                    <Link
                        to="/products"
                        style={inter}
                        className="inline-block px-6 py-3 bg-[#2F5233] text-[#F5F3EE] rounded-sm hover:bg-[#26401E] transition-colors"
                    >
                        Tiếp tục mua sắm
                    </Link>
                    {token && (
                        <div className="mt-4">
                            <Link
                                to={`/orders/${orderResult.orderId}`}
                                style={inter}
                                className="text-sm text-[#2F5233] underline underline-offset-2"
                            >
                                Xem đơn hàng vừa đặt
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAF8] px-6">
                <div className="text-center max-w-sm">
                    <h1 style={fraunces} className="text-3xl text-[#1F2420] mb-2">
                        Giỏ hàng đang trống
                    </h1>
                    <p style={inter} className="text-[#6B6F63] mb-6">
                        Thêm vài món đồ vào giỏ trước khi thanh toán nhé.
                    </p>
                    <Link
                        to="/products"
                        style={inter}
                        className="inline-block px-5 py-2.5 bg-[#2F5233] text-[#F5F3EE] rounded-sm hover:bg-[#26401E] transition-colors"
                    >
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] grid lg:grid-cols-[42%_58%]">
            <div className="bg-[#2F5233] text-[#F5F3EE] px-8 py-12 lg:px-12 lg:py-16 flex flex-col">
                <h1 style={fraunces} className="text-3xl mb-1">Đơn hàng của bạn</h1>
                <p style={inter} className="text-[#B9C4AE] text-sm mb-10">
                    {cart.length} sản phẩm
                </p>

                <div className="flex-1 space-y-0">
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-baseline justify-between py-3 border-t border-[#F5F3EE]/15"
                        >
                            <div style={inter} className="pr-4">
                                <div className="text-[15px]">{item.name}</div>
                                <div className="text-[#B9C4AE] text-sm">x{item.quantity}</div>
                            </div>
                            <div style={inter} className="text-[15px] whitespace-nowrap">
                                {formatVND(item.price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#F5F3EE]/25 mt-4 pt-6 flex items-baseline justify-between">
                    <span style={inter} className="text-[#B9C4AE] text-sm">Tổng cộng</span>
                    <span style={fraunces} className="text-4xl">{formatVND(total)}</span>
                </div>
            </div>

            <div className="px-8 py-12 lg:px-16 lg:py-16 max-w-xl">
                <h2 style={fraunces} className="text-2xl text-[#1F2420] mb-1">
                    Thông tin giao hàng
                </h2>
                <p style={inter} className="text-[#6B6F63] mb-8">
                    Chúng tôi sẽ liên hệ qua số điện thoại này để xác nhận đơn.
                </p>

                <form onSubmit={handleSubmit} style={inter} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm text-[#6B6F63] mb-1.5">
                            Họ và tên
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tên bạn ở đây"
                            className="w-full px-3.5 py-2.5 bg-transparent border border-[#DAD6C9] rounded-sm text-[#1F2420] placeholder:text-[#B0AC9C] outline-none focus:border-[#2F5233] focus:ring-1 focus:ring-[#2F5233] transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm text-[#6B6F63] mb-1.5">
                            Số điện thoại
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="09xx xxx xxx"
                            className="w-full px-3.5 py-2.5 bg-transparent border border-[#DAD6C9] rounded-sm text-[#1F2420] placeholder:text-[#B0AC9C] outline-none focus:border-[#2F5233] focus:ring-1 focus:ring-[#2F5233] transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm text-[#6B6F63] mb-1.5">
                            Địa chỉ giao hàng
                        </label>
                        <input
                            id="address"
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Số nhà, đường, phường/xã, quận/huyện"
                            className="w-full px-3.5 py-2.5 bg-transparent border border-[#DAD6C9] rounded-sm text-[#1F2420] placeholder:text-[#B0AC9C] outline-none focus:border-[#2F5233] focus:ring-1 focus:ring-[#2F5233] transition-colors"
                        />
                    </div>

                    {error && <p className="text-[#B3413B] text-sm -mt-2">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#2F5233] text-[#F5F3EE] rounded-sm hover:bg-[#26401E] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? "Đang xử lý..." : `Đặt hàng — ${formatVND(total)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Checkout;