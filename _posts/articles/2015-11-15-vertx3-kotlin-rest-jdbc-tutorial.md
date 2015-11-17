---
title: Vertx3 + Kotlin Tutorial for a REST API with a JBDC backend
excerpt: "Step by step tutorial to publish an asynchronous REST API that access a data base using JDBC, using Vertx3 for asynchronous programming and Kotlin for easy development."
tags: [vertx, kotlin, rest, jdbc]
modified: 2015-11-15
comments: true
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

This is a tutorial for beginners and intermediate developers that want a quick
dive into asynchronous programming with [Vertx](http://vertx.io/) and [Kotlin](https://kotlinlang.org/).

### Requirements

This tutorial assumes you have installed Java, Maven, Git, and as you want to taste *Kotlin*, you probably use [IntelliJ](https://www.jetbrains.com/idea/).

### Getting the code

I've published the [tutorial code in GitHub](https://github.com/maballesteros/vertx3-kotlin-rest-jdbc-tutorial), so create a work directory and clone the project:

{% highlight bash %}
git clone git@github.com:maballesteros/vertx3-kotlin-rest-jdbc-tutorial.git
{% endhighlight %}

After cloning the project, open the main `pom.xml` in IntelliJ. It's a maven multiproject, with a module (subproject) for each step.

### Step 1: Starting a Vertx simple HTTP server

In this [first step](https://github.com/maballesteros/vertx3-kotlin-rest-jdbc-tutorial/blob/master/step01/src/tutorial01.kt) just want to show how easy is to have an asynchronous HTTP server using Vertx and Kotlin... even without adding Kotlin sugar (more on this later).

{% highlight kotlin linenos %}
{% raw %}
import io.vertx.core.Vertx
import io.vertx.ext.web.Router

object Vertx3KotlinRestJdbcTutorial {

    @JvmStatic fun main(args: Array<String>) {
        val vertx = Vertx.vertx()
        val server = vertx.createHttpServer()
        val port = 9000
        val router = Router.router(vertx)

        router.get("/").handler { it.response().end("Hello world!") }

        server.requestHandler { router.accept(it) }.listen(port) {
            if (it.succeeded()) println("Server listening at $port")
            else println(it.cause())
        }
    }
}
{% endraw %}
{% endhighlight %}

First, we get a `Vertx` instance, and create an `HttpServer` from it. The server is not yet started, so we can keep configuring it to match our needs. In this case, just handle `GET /` and return a classical `Hello world!`.


### Step 2: In-memory REST User repository

In the [second step](https://github.com/maballesteros/vertx3-kotlin-rest-jdbc-tutorial/blob/master/step02/src/tutorial02.kt) we define a simple User repository with the following API:

{% highlight kotlin linenos %}
{% raw %}
data class User(val id:String, val fname: String, val lname: String)

interface UserService {
    fun getUser(id: String): Future<User>
    fun addUser(user: User): Future<Unit>
    fun remUser(id: String): Future<Unit>
}
{% endraw %}
{% endhighlight %}

So, we have `User`s and a service to `get`, `add`, and `remove` them.

Notice that we're doing asynchronous programming, so we can't return directly a `User` or `Unit`. Instead, we *must* provide some kind of *callback* or return a `Future<T>` result that allows you listen to `success / fail` operation events.

In this step we'll implement this service with a mutable `Map` (a `HashMap`):

{% highlight kotlin linenos %}
{% raw %}
class MemoryUserService(): UserService {

    val _users = HashMap<String, User>()

    init {
        addUser(User("1", "user1_fname", "user1_lname"))
    }

    override fun getUser(id: String): Future<User> {
        return if (_users.containsKey(id)) Future.succeededFuture(_users.getOrImplicitDefault(id))
        else Future.failedFuture(IllegalArgumentException("Unknown user $id"))
    }

    override fun addUser(user: User): Future<Unit> {
        _users.put(user.id, user)
        return Future.succeededFuture()
    }

    override fun remUser(id: String): Future<Unit> {
        _users.remove(id)
        return Future.succeededFuture()
    }
}
{% endraw %}
{% endhighlight %}

Futhermore, we have to handle typical REST operations `GET`, `POST`, and `DELETE`.

Notice:

  - the call to `router.route().handler(BodyHandler.create())`, so we can fetch the request body as a `String`.
  - the use of `Gson` to encode / decode JSON
  - how to listen to future resolution (line 38: `future.setHandler`)

{% highlight kotlin linenos %}
{% raw %}
object Vertx3KotlinRestJdbcTutorial {
    val gson = Gson()

    @JvmStatic fun main(args: Array<String>) {
        val port = 9000
        val vertx = Vertx.vertx()
        val server = vertx.createHttpServer()
        val router = Router.router(vertx)
        router.route().handler(BodyHandler.create())
        val userService = MemoryUserService()

        router.get("/:userId").handler { ctx ->
            val userId = ctx.request().getParam("userId")
            jsonResponse(ctx, userService.getUser(userId))
        }

        router.post("/").handler { ctx ->
            val user = jsonRequest<User>(ctx, User::class)
            jsonResponse(ctx, userService.addUser(user))
        }

        router.delete("/:userId").handler { ctx ->
            val userId = ctx.request().getParam("userId")
            jsonResponse(ctx, userService.remUser(userId))
        }

        server.requestHandler { router.accept(it) }.listen(port) {
            if (it.succeeded()) println("Server listening at $port")
            else println(it.cause())
        }
    }

    fun jsonRequest<T>(ctx: RoutingContext, clazz: KClass<out Any>): T =
        gson.fromJson(ctx.bodyAsString, clazz.java) as T


    fun jsonResponse<T>(ctx: RoutingContext, future: Future<T>) {
        future.setHandler {
            if (it.succeeded()) {
                val res = if (it.result() == null) "" else gson.toJson(it.result())
                ctx.response().end(res)
            } else {
                ctx.response().setStatusCode(500).end(it.cause().toString())
            }
        }
    }
}
{% endraw %}
{% endhighlight %}


### Step 3: In-memory REST User repository (with simplified REST definitions)

In the [third step](https://github.com/maballesteros/vertx3-kotlin-rest-jdbc-tutorial/blob/master/step03/src/tutorial03.kt) we'll just simplify REST definitions.

We want to go from this code:

{% highlight kotlin linenos %}
{% raw %}
@JvmStatic fun main(args: Array<String>) {
    val port = 9000
    val vertx = Vertx.vertx()
    val server = vertx.createHttpServer()
    val router = Router.router(vertx)
    router.route().handler(BodyHandler.create())
    val userService = MemoryUserService()

    router.get("/:userId").handler { ctx ->
        val userId = ctx.request().getParam("userId")
        jsonResponse(ctx, userService.getUser(userId))
    }

    router.post("/").handler { ctx ->
        val user = jsonRequest<User>(ctx, User::class)
        jsonResponse(ctx, userService.addUser(user))
    }

    router.delete("/:userId").handler { ctx ->
        val userId = ctx.request().getParam("userId")
        jsonResponse(ctx, userService.remUser(userId))
    }

    server.requestHandler { router.accept(it) }.listen(port) {
        if (it.succeeded()) println("Server listening at $port")
        else println(it.cause())
    }
}
{% endraw %}
{% endhighlight %}

To this one, much more compact and semantic:

{% highlight kotlin linenos %}
{% raw %}
@JvmStatic fun main(args: Array<String>) {
    val port = 9000
    val vertx = Vertx.vertx()
    val userService = MemoryUserService()

    vertx.createHttpServer().restAPI(vertx) {

        get("/:userId") { send(userService.getUser(param("userId"))) }

        post("/") { send(userService.addUser(bodyAs(User::class))) }

        delete("/:userId") { send(userService.remUser(param("userId"))) }

    }.listen(port) {
        if (it.succeeded()) println("Server listening at $port")
        else println(it.cause())
    }
}
{% endraw %}
{% endhighlight %}

Let's compare both kind of definitions side by side:

{% highlight kotlin linenos %}
{% raw %}
router.get("/:userId").handler { ctx ->
    val userId = ctx.request().getParam("userId")
    jsonResponse(ctx, userService.getUser(userId))
}

router.post("/").handler { ctx ->
    val user = jsonRequest<User>(ctx, User::class)
    jsonResponse(ctx, userService.addUser(user))
}

----------

get("/:userId") { send(userService.getUser(param("userId"))) }

post("/") { send(userService.addUser(bodyAs(User::class))) }
{% endraw %}
{% endhighlight %}

So, we want to get rid of boilerplate code such `router.`, `.handler { ctx -> `, and `ctx.request().getParam()`. This code just obfuscate what we try to express in the REST API definitions. This is particularly evident when there's a bunch of business packages with lots of REST endpoints each. Then, the simpler the definitions, the better the maintenance tasks.

How do we get that *cleaner* and much more expressive code? Of course, with Kotlin sugar for DSL definitions. You can find the key idea at [Type Safe Builders](https://kotlinlang.org/docs/reference/type-safe-builders.html) in the main Kotlin site. We use those ideas and define the following extension methods:

{% highlight kotlin linenos %}
{% raw %}
val GSON = Gson()

fun HttpServer.restAPI(vertx: Vertx, body: Router.() -> Unit): HttpServer {
    val router = Router.router(vertx)
    router.route().handler(BodyHandler.create())  // Required for RoutingContext.bodyAsString
    router.body()
    requestHandler { router.accept(it) }
    return this
}

fun Router.get(path: String, rctx:RoutingContext.() -> Unit) = get(path).handler { it.rctx() }
fun Router.post(path: String, rctx:RoutingContext.() -> Unit) = post(path).handler { it.rctx() }
fun Router.put(path: String, rctx:RoutingContext.() -> Unit) = put(path).handler { it.rctx() }
fun Router.delete(path: String, rctx:RoutingContext.() -> Unit) = delete(path).handler { it.rctx() }

fun RoutingContext.param(name: String): String =
    request().getParam(name)

fun RoutingContext.bodyAs<T>(clazz: KClass<out Any>): T =
        GSON.fromJson(bodyAsString, clazz.java) as T

fun RoutingContext.send<T>(future: Future<T>) {
    future.setHandler {
        if (it.succeeded()) {
            val res = if (it.result() == null) "" else GSON.toJson(it.result())
            response().end(res)
        } else {
            response().setStatusCode(500).end(it.cause().toString())
        }
    }
}
{% endraw %}
{% endhighlight %}


### Step 4: JDBC backend REST User repository


### Step 5: JDBC backend REST User repository (with Promises and more Kotlin sugar)
