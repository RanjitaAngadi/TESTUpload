import React from "react";

function Footer() {
  return (
    <div className="card-footer text-muted  footr footer_style p-0">
      <span className="float-left">
        <span className="m-0">Copyright © 2021. </span>
        <span className="text_underline m-0"><a href="https://spmoilandgas.com/">
          SPM™ Oil &amp; Gas
        </a></span>. All rights reserved.
      </span>
      <span className="float-right ">
        <div class="terms">
          <a href="https://www.caterpillar.com/en/legal-notices/terms.html">
            <span id="lblTerms">Terms of Use</span></a> &nbsp;|&nbsp; <a href="https://www.caterpillar.com/en/legal-notices/privacy-notice.html">
            <span id="lblPrivacy">Privacy Policy</span></a>
        </div>
      </span>
    </div>
  );
}

export default Footer;
