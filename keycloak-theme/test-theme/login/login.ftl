<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "title">
        ${msg("loginTitle", " Meitrex")}
    <#elseif section = "header">
        <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet"/>
        <script>
            function togglePassword() {
                var x = document.getElementById("password");
                var v = document.getElementById("vi");
            }
        </script>
    <#elseif section = "form">
        <div>
            <img class="logo" src="${url.resourcesPath}/img/logo.png" alt="Meitrex">
        </div>
        <div class="box-container">
            <div>
                <p class="application-name">${msg("loginTitle", " Meitrex")}</p>
            </div>
            <#if realm.password>
                <div>
                <form id="kc-form-login" class="form" onsubmit="return true;" action="${url.loginAction}" method="post">
                        <input id="username" class="login-field" placeholder="${msg("username")}" type="text" name="username" tabindex="0">
                    <input id="password" class="login-field" placeholder="${msg("password")}" type="password" name="password" tabindex="0">
                    <input class="submit" type="submit" value="${msg("doLogIn")}" tabindex="0">
                    </form>
                </div>
            </#if>
            <#if social.providers?? && social.providers?has_content>
                <p class="para">${msg("selectAlternative")}</p>
                <div id="social-providers">
                    <#list social.providers as p>
                    <input class="social-link-style" type="button" onclick="location.href='${p.loginUrl}';" value="${p.displayName}"/>
                    </#list>
                </div>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
