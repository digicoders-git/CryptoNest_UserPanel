import React, { useState } from "react";
import {
  FaPhone, FaEnvelope, FaUser, FaComment, FaChevronLeft,
  FaHeadset, FaClock, FaGlobe, FaTelegramPlane, FaWhatsapp,
  FaCheckCircle, FaQuestionCircle,
} from "react-icons/fa";
import {
  RiCustomerService2Line, RiMailSendLine, RiShieldUserLine,
  RiMessage3Line, RiNotification3Line, RiRefreshLine,
  RiLiveLine, RiCustomerServiceLine, RiQuestionnaireLine,
  RiSendPlaneFill, RiTimeLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import { contactAPI } from "../services/api";

const ContactUs = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, description } = formData;

    if (!name || !email || !phone || !description) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">OK</span>',
      });
      return;
    }

    setLoading(true);

    try {
      await contactAPI.create({
        name,
        email,
        phone,
        description,
      });

      Swal.fire({
        icon: "success",
        title: "Message Sent! 🚀",
        text: "Our team will get back to you shortly.",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">DONE</span>',
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        description: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.response?.data?.message || "Server error",
        background: '#1A1A1A',
        color: '#fff',
        confirmButtonColor: "#FCE270",
        confirmButtonText: '<span style="color: #000; font-weight: 900;">TRY AGAIN</span>',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] max-w-md mx-auto relative pt-2">

      {/* STICKY HEADER */}


      {/* CONTENT */}
      <div className="px-4 pb-28 space-y-4">

        {/* HERO SUPPORT CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] p-6 rounded-[28px] border border-white/5 shadow-2xl mt-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FCE270]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaHeadset className="text-[#FCE270]" size={28} />
            </div>
            <h3 className="text-[20px] font-black text-white mb-2">Need Help?</h3>
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed max-w-[250px] mx-auto">
              Our support team is available 24/7 to assist you with any queries
            </p>

            {/* Status Badge */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-green-400 font-black uppercase tracking-wider">Online Now</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5">
                <RiTimeLine className="text-gray-400" size={12} />
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK CONTACT CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2.5">
              <FaWhatsapp className="text-green-400" size={18} />
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">WhatsApp</p>
            <p className="text-[11px] text-white font-bold">+1 (555) 123-4567</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-4 rounded-2xl border border-white/5 text-center active:scale-[0.97] transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2.5">
              <FaTelegramPlane className="text-blue-400" size={18} />
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Telegram</p>
            <p className="text-[11px] text-white font-bold">@CryptoNest</p>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#161616] to-[#111111] rounded-[24px] border border-white/5 shadow-xl">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FCE270]/3 rounded-full -mr-14 -mt-14 blur-2xl"></div>

          <div className="relative z-10 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FCE270]/10 border border-[#FCE270]/20 flex items-center justify-center">
                <RiMessage3Line className="text-[#FCE270]" size={18} />
              </div>
              <div>
                <h3 className="font-black text-[14px] text-white">Send Message</h3>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider">We'll respond shortly</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name & Phone Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FaUser size={10} className="text-gray-600" />
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-3.5 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 focus:ring-0 transition-all outline-none"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FaPhone size={10} className="text-gray-600" />
                    Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-3.5 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 focus:ring-0 transition-all outline-none"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FaEnvelope size={10} className="text-gray-600" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-3.5 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 focus:ring-0 transition-all outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FaComment size={10} className="text-gray-600" />
                  Message
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-3.5 text-sm text-white placeholder-gray-700 focus:border-[#FCE270]/30 focus:ring-0 transition-all outline-none resize-none"
                    placeholder="How can we help you?"
                  />
                  <span className="absolute bottom-3 right-3 text-[9px] text-gray-600 font-bold">
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FCE270] text-black h-13 rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#FCE270]/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#f7d64a]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RiSendPlaneFill size={16} />
                    <span>Submit Query</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ QUICK LINK */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#151515] rounded-2xl border border-white/5 p-4 flex items-center justify-between active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <RiQuestionnaireLine className="text-purple-400" size={18} />
            </div>
            <div>
              <p className="text-[12px] font-black text-white">Frequently Asked Questions</p>
              <p className="text-[9px] text-gray-500 font-bold">Find answers quickly</p>
            </div>
          </div>
          <FaChevronLeft className="text-gray-600 rotate-180" size={12} />
        </div>

      </div>
    </div>
  );
};

export default ContactUs;