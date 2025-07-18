<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=messagesPerField.exists('global') displayInfo=false; section>
    <#if section = "title">
        ${msg("registerTitle")}
    <#elseif section = "header">
    <#elseif section = "welcome">
        <div class="register-left">
            <img class="logo" src="${url.resourcesPath}/img/logo.png" alt="Meitrex">
            <p class="application-welcome-text">Welcome to</p>
            <p class="application-name">MEITREX</p>
        </div>
    <#elseif section = "form">
        <p class="register-title">${msg("registerTitle")}</p>
        <form id="kc-register-form" class="form" action="${url.registrationAction}" method="post">
            <input class="register-field<#if messagesPerField.existsError('firstName')> input-error</#if>" type="text" id="firstName" name="firstName" placeholder="${msg("firstName")}" value="${(register.formData.firstName!'')}" autofocus>
            <div class="error-area">
                <#if messagesPerField.existsError('firstName')>
                    <span id="input-error" class="register-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('firstName'))?no_esc}
                    </span>
                </#if>
            </div>
            <input class="register-field<#if messagesPerField.existsError('lastName')> input-error</#if>" type="text" id="lastName" name="lastName" placeholder="${msg("lastName")}" value="${(register.formData.lastName!'')}">
            <div class="error-area">
                <#if messagesPerField.existsError('lastName')>
                    <span id="input-error" class="register-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('lastName'))?no_esc}
                    </span>
                </#if>
            </div>
            <input class="register-field<#if messagesPerField.existsError('email')> input-error</#if>" type="text" id="email" name="email" placeholder="${msg("email")}" value="${(register.formData.email!'')}">
            <div class="error-area">
                <#if messagesPerField.existsError('email')>
                    <span id="input-error" class="register-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('email'))?no_esc}
                    </span>
                </#if>
            </div>
            <input class="register-field<#if messagesPerField.existsError('username')> input-error</#if>" type="text" id="username" name="username" placeholder="${msg("username")}" value="${(register.formData.username!'')}">
            <div class="error-area">
                <#if messagesPerField.existsError('username')>
                    <span id="input-error" class="register-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('username'))?no_esc}
                    </span>
                </#if>
            </div>
            <input class="register-field<#if messagesPerField.existsError('password')> input-error</#if>" type="password" id="password" name="password" placeholder="${msg("password")}" autocomplete="new-password">
            <div class="error-area">
                <#if messagesPerField.existsError('password')>
                    <span id="input-error" class="register-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('password'))?no_esc}
                    </span>
                </#if>
            </div>
            <input class="register-field<#if messagesPerField.existsError('password-confirm')> input-error</#if>" type="password" id="password-confirm" name="password-confirm" placeholder="${msg("passwordConfirm")}" autocomplete="new-password">
            <div class="error-area">
                <#if messagesPerField.existsError('password-confirm')>
                    <span id="input-error" class="register-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>
            <input class="register-submit" type="submit" value="${msg("doRegister")}">
            <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                <div class="register-link">
                    <span><a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>