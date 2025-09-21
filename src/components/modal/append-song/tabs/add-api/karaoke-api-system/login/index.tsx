"use client";

import React, { useState, FormEvent } from "react";
import Button from "@/components/common/button/button";
import CardCommon from "@/components/common/display/card";
import { appendLocalConfig } from "@/lib/local-storege/config";
import useConfigStore from "@/features/config/config-store";
import { API_BASE_URL } from "../config/value";
import {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "../lib/auth";
import { fetchAPI } from "../lib/fetch";
import { useNotification } from "../common/notification-provider";
import InputCommon from "@/components/common/data-input/input";
import LabelCommon from "../common/label";

const ApiLoginRegister: React.FC = () => {
  const { notify } = useNotification();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const setConfig = useConfigStore((state) => state.setConfig);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setMessage(null);
    setVerificationCode(null);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setVerificationCode(null);

    try {
      if (mode === "login") {
        try {
          const data = await fetchAPI<LoginBody, LoginResponse>(
            `${API_BASE_URL}/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: {
                username: email,
                password,
              },
            }
          );

          appendLocalConfig({ token: data.access_token });
          setConfig({ token: data.access_token });
          setMessage("เข้าสู่ระบบสำเร็จ!");
          notify({ type: "success", text: `เข้าสู่ระบบสำเร็จ` });
        } catch (err: any) {
          console.log("status:", err.status);
          console.log("body:", err.body);
          notify({ type: "error", text: `ผิดพลาด: ${err.message}` });
        }
      } else {
        const body = {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        };

        const data = await fetchAPI<RegisterBody, RegisterResponse>(
          `${API_BASE_URL}/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          }
        );

        if (!data) throw new Error("การสมัครสมาชิกล้มเหลว");

        if (data.manual_verification_required && data.verification_code) {
          setMessage(
            "สมัครสมาชิกสำเร็จ แต่ไม่สามารถส่งอีเมลยืนยันได้ กรุณาใช้รหัสด้านล่างเพื่อยืนยันกับผู้ดูแลระบบ:"
          );
          setVerificationCode(data.verification_code);
        } else {
          setMessage("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
        }
      }
    } catch (err: any) {
      setError(
        typeof err === "string"
          ? err
          : err?.message
          ? String(err.message)
          : JSON.stringify(err)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-gradient-to-r from-violet-600 to-indigo-600">
      <CardCommon className="max-w-md mx-2">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {mode === "login" ? "ระบบจัดเก็บเพลง" : "สมัครสมาชิก"}
        </h2>

        {error && (
          <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
        )}
        {message && (
          <p className="mb-4 text-center text-green-600 font-medium">
            {message}
          </p>
        )}
        {verificationCode && (
          <div className="mb-4 rounded border border-green-500 bg-green-50 p-4 text-center break-all">
            รหัสยืนยันของคุณ:{" "}
            <strong className="font-bold">{verificationCode}</strong>
          </div>
        )}

        {!message && !verificationCode && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <LabelCommon htmlFor="firstName">ชื่อ</LabelCommon>
                  <InputCommon
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="!text-black w-full"
                  />
                </div>
                <div>
                  <LabelCommon htmlFor="lastName">นามสกุล</LabelCommon>
                  <InputCommon
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="!text-black w-full"
                  />
                </div>
              </>
            )}

            <div>
              <LabelCommon htmlFor="email">อีเมล</LabelCommon>
              <InputCommon
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="!text-black w-full"
              />
            </div>

            <div>
              <LabelCommon htmlFor="password">รหัสผ่าน</LabelCommon>
              <InputCommon
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="!text-black w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading
                ? "กำลังดำเนินการ..."
                : mode === "login"
                ? "เข้าสู่ระบบ"
                : "สร้างบัญชี"}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-gray-600">
          {mode === "login" ? "ยังไม่มีบัญชีผู้ใช้?" : "มีบัญชีผู้ใช้อยู่แล้ว?"}{" "}
          <span
            onClick={toggleMode}
            className="cursor-pointer font-semibold text-blue-600 hover:underline"
          >
            {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </span>
        </p>
      </CardCommon>
    </div>
  );
};

export default ApiLoginRegister;
