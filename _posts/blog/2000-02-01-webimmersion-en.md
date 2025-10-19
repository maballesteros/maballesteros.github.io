---
title: WebImmersion - A new kind of WWW
excerpt: "A deep dive into the 2000 WebImmersion whitepaper, a vision for an object-oriented, immersive web."
tags: [webimmersion]
lang: en
ref: webimmersion
modified: 2025-10-19
comments: true
permalink: /en/blog/webimmersion/
---

<section id="table-of-contents" class="toc">
  <header>
    <h3>Overview</h3>
  </header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

WebImmersion was a wild and great idea... I was 26 and wanted to change the world. This post provides a detailed overview of the original 2000 whitepaper.

---

## WebImmersion - Technology Overview

> A file is to HTTP as a Java object is to WIP (Web Immersion Protocol).

WebImmersion is an extension of the current WWW that makes developing highly interactive immersive worlds, creating .com solutions, and building Internet applications a routine task. With WebImmersion, the Internet evolves from a vast network of hyperlinked documents into a living community of Java objects that communicate, interoperate, offer their services, and, with the right approach, create immersive worlds where users can dive in, interact with the environment, manipulate Java objects through their interfaces, and interconnect services that never collaborated before to create personalized solutions to their own problems.

WebImmersion does not compete with Jini or EJB, but rather extends them and offers a new perspective on them.

Thanks to WebImmersion, Sun Microsystems' coined phrase “The network is the computer” becomes a tangible reality.

### Historical Framework

Back in 1995, when Java appeared on the market, the Internet was beginning to experience a subtle technological shift. The World Wide Web (WWW), newly born in its multimedia version, was starting to spread massively across all continents. The secret to its success was simple: the notion of a hyperlink allowed linking documents of related (or not) content that could hook the incipient cybernaut to the network. However, the hyperlink was not the only key to the development of the WWW. Browsers like Mosaic and Netscape took the WWW to a new level by introducing multimedia information in the pages they displayed. Shortly after, Java and its applets arrived, which, although they brought animation to the pages in which they were incorporated, very few understood then what the true implication of that was. Now, after a decade of the WWW, Java has reached the appropriate level of maturity to make the WWW take a new leap. This is the main objective of WebImmersion.

### Related Technologies

WebImmersion is not a basic technological change like Java was; rather, it is a combination and restructuring of existing technologies to develop a new technology with its own market and its own processes.

The technologies closest to WebImmersion and on which it is (in some way) based are HTTP/HTML technology or what we know as the WWW, EnterpriseJavaBeans (EJB), and Jini. Since it is necessary to clearly understand the key points of these technologies to understand what WebImmersion is exactly, we will review them below. All of them rest to a greater or lesser extent on the client/server model.

#### WWW and HTTP/HTML
The most characteristic points of HTTP/HTML (even XML) technology are the following:

- Servers located (by IP or DNS) that supply files specified by a URL to remote clients.
- Clients designed as “generic content presenters” (browsers), with the ability to extend their capacity to present new content through plugins.
- Content associated with the technology: HTML page. This is a formatted text file that incorporates hyperlinks (URL references to other files, potentially on other WWW servers).
- The client/server interface is known by both parties: HTTP protocol.

For the purposes of this explanation, **the most important point to remember about HTML technology is that it presents the network as a vast space of interrelated documents (multimedia or not), and that the “experience” of “surfing the net” becomes jumping from document to document**.

#### EnterpriseJavaBeans

EJB technology is based on the following fundamental points:

- A client of any type, not necessarily Java.
- An EJB server and its container, which contain a collection of EJB services accessible via JNDI.
- Existing company systems, as EJB's main purpose is to serve as a middle tier for established systems in the company.
- Only data is transferred: there is no code mobility.

Its application space is reduced to that of computer systems for companies: it was conceived that way.

#### Jini

The most important points of Jini technology are the following:

- Three types of elements: services, clients who wish to use these services, and lookup services that act as intermediaries.
- Objects are transferred between the different elements of Jini: serialized content and code corresponding to the class of the object.
- The client locates a proxy object of the service it wants to use in the lookup service and uses this proxy as an interface.

Jini's application space is mainly that of intelligent consumer electronic devices and is, therefore, enormous.

### WebImmersion Technology

WebImmersion technology, as we have already pointed out, represents a reformulation of existing technologies that provides a new field of work within current Information Technologies.

The fundamental objective of WebImmersion is to make a qualitative leap in the way the human user perceives the network. Until now, the largest percentage of the Internet population conceives the network as the current WWW. This is not the only way to “perceive” the network, as we will see with WebImmersion. “Perception” is probably the most important concept within WebImmersion.

A key element of WebImmersion is that it does not exclude other technologies, but extends them naturally.

#### Fundamental Elements

- In addition to HTTP, Jini, or EJB servers, a new type of server appears, located by IP or DNS, which serves Java objects (specified by a URL) to remote clients.
- The main client will be the **Immerser**, a generic content presenter that extends the content presentation skills of the browser and adds the ability to visually present Java objects.
- Objects are structured on the server in a tree form.
- Special Java objects known as **Server Entities** exist, which the server treats specially.
- The concept of a hyperlink is extended with WebImmersion, as URLs can now also point to Java object servers.
- The Immerser has perfectly integrated the concept of drag & drop, cut & paste, and other forms of information transfer.

--- 

## Details of the WebImmersion Architecture

### General Architecture Scheme

WebImmersion is composed of three clearly differentiated environments or frameworks:

- `ImmersionWorldServerFramework`
- `ImmersionWorldEntitiesFramework`
- `WebImmersorFramework`

`ImmersionWorldServerFramework` frames all the details of the technology related to the Java object server, which we call `ImmersionWorldServer`.

`ImmersionWorldEntitiesFramework` is in charge of defining what Server Entities and Client Entities are, how they communicate, and what facilities they offer for the development of new types of Entities.

Finally, `WebImmersorFramework` has the responsibility of creating the interface for the human user. It is oriented towards the development of a generic client that extends the possibilities of a traditional WWW browser, but capable of visually presenting Java objects extracted from an `ImmersionWorldServer`.

### Main Elements of WebImmersion

#### The specific server for WebImmersion: ImmersionWorldServer

WebImmersion introduces a new type of server: `ImmersionWorldServer`. This server is a server of Java objects structured according to a tree hierarchy. The request for Java objects to the server is made via RMI through the `ImmersionWorldServerRemoteInterface` interface.

The access of a client to a Java object of the server through the `ImmersionWorldServerRemoteInterface` interface defines the **Web Immersion Protocol**, or “wip”.

#### The special objects for WebImmersion: ServerEntities and ClientEntities

WebImmersion technology introduces classes of objects that have a special behavior for immersion servers and for WebImmersor clients: Server Entities and Client Entities.

Server Entities are Java objects located at some point in the object tree of the immersion server but which, unlike any other Java object, are not returned to the client when said object is requested. Instead of returning a copy of the object, the server returns a Client Entity generated by the Server Entity itself. This Client Entity will normally be linked to the Server Entity and will act as a remote interface of the server entity.

Client Entities are the Java objects returned by the server when a client accesses a Server Entity. These Client Entities present a known interface through which the WebImmersor can ask it to create a GUI to be presented within the content presentation area.

#### The specific client for WebImmersion: WebImmersor

WebImmersion uses as its main client application (although not the only possible one) the WebImmersor, a 100% Java application designed as a generic content presenter, extensible through plugins.

As a generic content presenter, it is, among other things, a generic browser of the current WWW. It accepts URLs of HTML, JPG, MPEG files, etc. and presents them on the screen. However, unlike traditional browsers, it has a notable feature: the user is able to separate the content presentation area arbitrarily.

### Conclusions

The observant reader will have already noticed that if we are able to bring an “ImageMap” or a “GraphicChatRoom” with their respective editors, nothing prevents us from bringing any application, regardless of its type. With WebImmersion, the phrase coined by Sun, “The network is the computer,” takes on its fullest meaning, because with WebImmersion, computation is distributed between immersion servers and WebImmersor clients. Working on the network is, with WebImmersion, a simple, comfortable, and extremely easy-to-use reality.

The business opportunities that appear naturally with WebImmersion are countless. We will list just a few of them:

- Sale of virtual homes.
- Sale of spaces for commercial companies.
- Development of internal applications (in Intranets) in companies with almost zero user administration and configuration.
- Development of external applications (for the Internet) that offer proprietary services (complex algorithms, etc.) for a fee.
- Leisure. The opportunities are immense in this field.
- Remote control of facilities.