import React from "react";
import styles from "./TermsAgreement.module.scss";

interface TermsAgreementProps {
  termsAgreed: boolean;
  setTermsAgreed: (value: boolean) => void;
  privacyAgreed: boolean;
  setPrivacyAgreed: (value: boolean) => void;
}

const TermsAgreement = ({
  termsAgreed,
  setTermsAgreed,
  privacyAgreed,
  setPrivacyAgreed,
}: TermsAgreementProps) => {
  return (
    <div className={styles.termsContainer}>
      {/* 서비스 이용 약관 */}
      <label className={styles.termsLabel} htmlFor="terms-checkbox">
        서비스 이용 약관에 동의합니다. (필수)
        <input
          type="checkbox"
          id="terms-checkbox"
          checked={termsAgreed}
          onChange={(e) => setTermsAgreed(e.target.checked)}
          className={styles.termsCheckbox}
          required
        />
      </label>
      <div className={styles.termsBox}>
        <p>
          1. 서비스 목적 및 제공 내용: 본 서비스는 블로그 게시물 작성, 공유,
          관리 기능을 제공합니다.
        </p>
        <p>2. 사용자 책임:</p>
        <ul>
          <li>
            사용자는 불법 콘텐츠를 게시하거나 타인의 권리를 침해하지 않아야
            합니다.
          </li>
          <li>타인의 계정을 무단으로 사용해서는 안 됩니다.</li>
        </ul>
        <p>3. 서비스 제공자의 책임:</p>
        <ul>
          <li>서비스 중단 시 사용자에게 사전 공지합니다.</li>
          <li>유지보수로 인한 데이터 손실의 책임을 지지 않습니다.</li>
        </ul>
      </div>

      {/* 개인정보 이용 약관 */}
      <label className={styles.termsLabel} htmlFor="privacy-checkbox">
        개인정보 수집 및 이용 약관에 동의합니다. (필수)
        <input
          type="checkbox"
          id="privacy-checkbox"
          checked={privacyAgreed}
          onChange={(e) => setPrivacyAgreed(e.target.checked)}
          className={styles.termsCheckbox}
          required
        />
      </label>
      <div className={styles.termsBox}>
        <p>
          개인정보 수집 목적: 본 서비스는 회원가입, 계정 관리 및 보안 강화를
          위해 개인정보를 수집합니다.
        </p>
        <p>수집 항목: 이메일, 닉네임, 프로필 이미지 (선택 사항)</p>
        <p>개인정보 보관 기간: 회원 탈퇴 시까지 보관됩니다.</p>
      </div>
    </div>
  );
};

export default TermsAgreement;
