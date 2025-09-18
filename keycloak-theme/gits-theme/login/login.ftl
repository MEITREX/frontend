<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=social.displayInfo; section>
    <#if section = "title">
        ${msg("loginTitle", " Meitrex")}
    <#elseif section = "header">
        <script>
            function togglePassword() {
                var x = document.getElementById("password");
                var v = document.getElementById("vi");
            }
        </script>
    <#elseif section = "welcome">
    <#elseif section = "form">
        <p class="login-title">${msg("loginAccountTitle")}</p>
        <#if realm.password>
            <form id="kc-form-login" class="form" onsubmit="return true;" action="${url.loginAction}" method="post">
                <#assign isError = (messagesPerField.existsError('username','password'))>
                <input id="username" class="login-field<#if isError> input-error</#if>" placeholder="${msg("usernameOrEmail")}" type="text" name="username" tabindex="0" autofocus>
                <input id="password" class="login-field<#if isError> input-error</#if>" placeholder="${msg("password")}" type="password" name="password" tabindex="0">
                <div class="error-area">
                    <#if messagesPerField.existsError('username','password')>
                        <span id="input-error" class="login-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                        </span>
                    </#if>
                </div>
                <input class="submit" type="submit" value="${msg("doLogIn")}" tabindex="0">
                <#if realm.registrationAllowed>
                    <div class="action-link register-link">
                        <span>${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a></span>
                    </div>
                </#if>
            </form>
        </#if>
        <div class="${properties.kcFormOptionsWrapperClass!} mt-sm">
            <#if realm.resetPasswordAllowed>
                <span class="action-link"><a tabindex="5" href="${url.loginResetCredentialsUrl}">
                    ${msg("doForgotPassword")}
                </a></span>
            </#if>
        </div>
        <#if social.providers?? && social.providers?has_content>
            <div id="social-providers">
                <#list social.providers as p>
                    <input class="social-link-style" type="button" onclick="location.href='${p.loginUrl}';" value="${p.displayName}"/>
                </#list>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>