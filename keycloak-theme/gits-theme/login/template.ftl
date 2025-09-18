<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="robots" content="noindex, nofollow">
        <link rel="icon" href="${url.resourcesPath}/img/favicon.ico"/>

        <title><#nested "title"></title>
        <#if properties.styles?has_content>
            <#list properties.styles?split(' ') as style>
                <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
            </#list>
        </#if>
    </head>

	<body>
        <div class="login-content">
            <div class="box">
                <#nested "welcome">
                 <div class="login-left">
                    <img class="logo" src="${url.resourcesPath}/img/logo.png" alt="Meitrex">
                    <p class="application-welcome-text">Welcome to</p>
                    <p class="application-name">MEITREX</p>
                </div>
                <div class="login-right">
                    <#nested "header">
                    <#nested "form">

                    <div class="message-area">
                        <#if displayMessage && message?has_content>
                            <div class="alert alert-${message.type}">
                                <#if message.type = 'success'><span class="${properties.kcFeedbackSuccessIcon!}"></span></#if>
                                <#if message.type = 'warning'><span class="${properties.kcFeedbackWarningIcon!}"></span></#if>
                                <#if message.type = 'error'><span class="${properties.kcFeedbackErrorIcon!}"></span></#if>
                                <#if message.type = 'info'><span class="${properties.kcFeedbackInfoIcon!}"></span></#if>
                                <span class="message-text">${message.summary}</span>
                            </div>
                        </#if>
                    </div>
                </div>
            </div>
        </div>
	</body>
</html>
</#macro>