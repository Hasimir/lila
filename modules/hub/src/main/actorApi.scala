package lila.hub
package actorApi

import lila.common.LightUser

import akka.actor.ActorRef
import play.api.libs.json._
import play.twirl.api.Html

case class SendTo(userId: String, message: JsObject)

object SendTo {
  def apply[A: Writes](userId: String, typ: String, data: A): SendTo =
    SendTo(userId, Json.obj("t" -> typ, "d" -> data))
}

case class SendTos(userIds: Set[String], message: JsObject)

object SendTos {
  def apply[A: Writes](userIds: Set[String], typ: String, data: A): SendTos =
    SendTos(userIds, Json.obj("t" -> typ, "d" -> data))
}

sealed abstract class RemindDeploy(val key: String)
case object RemindDeployPre extends RemindDeploy("deployPre")
case object RemindDeployPost extends RemindDeploy("deployPost")
case class Deploy(event: RemindDeploy, html: String)
case class StreamsOnAir(html: String)

package map {
case class Get(id: String)
case class Tell(id: String, msg: Any)
case class TellAll(msg: Any)
case class Ask(id: String, msg: Any)
case class AskAll(msg: Any)
case object Size
}

case class WithUserIds(f: Iterable[String] => Unit)

case object GetUids

package report {
case class Cheater(userId: String, text: String)
case class Check(userId: String)
case class Blocked(userId: String, blocked: Int, followed: Int)
}

package mod {
case class MarkCheater(userId: String)
}

package setup {
case class RemindChallenge(gameId: String, from: String, to: String)
case class DeclineChallenge(gameId: String)
}

package captcha {
case object AnyCaptcha
case class GetCaptcha(id: String)
case class ValidCaptcha(id: String, solution: String)
}

package lobby {
case class ReloadTournaments(html: String)
case object NewForumPost
}

package timeline {
case class ReloadTimeline(user: String)

sealed trait Atom
case class Follow(u1: String, u2: String) extends Atom
case class TeamJoin(userId: String, teamId: String) extends Atom
case class TeamCreate(userId: String, teamId: String) extends Atom
case class ForumPost(userId: String, topicName: String, postId: String) extends Atom
case class NoteCreate(from: String, to: String) extends Atom
case class TourJoin(userId: String, tourId: String, tourName: String) extends Atom
case class QaQuestion(userId: String, id: Int, title: String) extends Atom
case class QaAnswer(userId: String, id: Int, title: String, answerId: Int) extends Atom
case class QaComment(userId: String, id: Int, title: String, commentId: String) extends Atom

object atomFormat {
  implicit val followFormat = Json.format[Follow]
  implicit val teamJoinFormat = Json.format[TeamJoin]
  implicit val teamCreateFormat = Json.format[TeamCreate]
  implicit val forumPostFormat = Json.format[ForumPost]
  implicit val noteCreateFormat = Json.format[NoteCreate]
  implicit val tourJoinFormat = Json.format[TourJoin]
  implicit val qaQuestionFormat = Json.format[QaQuestion]
  implicit val qaAnswerFormat = Json.format[QaAnswer]
  implicit val qaCommentFormat = Json.format[QaComment]
}

object propagation {
  sealed trait Propagation
  case class Users(users: List[String]) extends Propagation
  case class Followers(user: String) extends Propagation
  case class Friends(user: String) extends Propagation
  case class StaffFriends(user: String) extends Propagation
  case class ExceptUser(user: String) extends Propagation
}

import propagation._

case class Propagate(data: Atom, propagations: List[Propagation] = Nil) {
  def toUsers(ids: List[String]) = add(Users(ids))
  def toUser(id: String) = add(Users(List(id)))
  def toFollowersOf(id: String) = add(Followers(id))
  def toFriendsOf(id: String) = add(Friends(id))
  def toStaffFriendsOf(id: String) = add(StaffFriends(id))
  def exceptUser(id: String) = add(ExceptUser(id))
  private def add(p: Propagation) = copy(propagations = p :: propagations)
}
}

package game {
case class ChangeFeatured(id: String, html: Html)
case object Count
}

package message {
case class LichessThread(from: String, to: String, subject: String, message: String)
}

package router {
case class Abs(route: Any)
case class Nolang(route: Any)
case object Homepage
case class TeamShow(id: String)
case class User(username: String)
case class Player(fullId: String)
case class Watcher(gameId: String, color: String)
case class Pgn(gameId: String)
case class Tourney(tourId: String)
case class Puzzle(id: Int)
}

package forum {
case class MakeTeam(id: String, name: String)
}

package ai {
case class Analyse(gameId: String, uciMoves: List[String], initialFen: Option[String], requestedByHuman: Boolean, kingOfTheHill: Boolean)
case class AutoAnalyse(gameId: String)
}

package monitor {
case object AddRequest
case object Update
}

package round {
case class MoveEvent(
  gameId: String,
  fen: String,
  move: String,
  ip: String)
case class NbRounds(nb: Int)
}

package evaluation {
case class AutoCheck(userId: String)
case class Refresh(userId: String)
}

package bookmark {
case class Toggle(gameId: String, userId: String)
case class Remove(gameIds: List[String])
}

package relation {
case class ReloadOnlineFriends(userId: String)
case class GetOnlineFriends(userId: String)
case class OnlineFriends(users: List[LightUser])
case class Block(u1: String, u2: String)
case class UnBlock(u1: String, u2: String)
}
